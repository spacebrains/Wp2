import * as React from 'react';
import * as ReactDom from 'react-dom';
import {Version} from '@microsoft/sp-core-library';
import {BaseClientSideWebPart} from '@microsoft/sp-webpart-base';
import {
  IPropertyPaneConfiguration,
  IPropertyPaneDropdownOption,
  PropertyPaneSlider,
  PropertyPaneTextField,
} from '@microsoft/sp-property-pane';
import {
  PropertyFieldListPicker,
  PropertyFieldListPickerOrderBy
} from '@pnp/spfx-property-controls/lib/PropertyFieldListPicker';
import {IODataList} from '@microsoft/sp-odata-types';
import * as strings from 'Wp2WebPartStrings';
import Wp2 from './components/Wp2';
import {IWp2Props} from './components/Wp2';


export interface IWp2WebPartProps {
  WebPartTitle: string;
  siteUrl: string;
  list: IPropertyPaneDropdownOption;
  numberOfItems: number;
  ODataFilter: string;
}

type IOptions = Array<IPropertyPaneDropdownOption>;


export default class Wp2WebPart extends BaseClientSideWebPart<IWp2WebPartProps> {
  private options: IOptions = [];
  private isSiteFound: boolean = true;


  protected onInit(): Promise<void> {
    return this.loadOptions();
  }


  public loadOptions = async () => {
    try {
      const siteUrl = this.properties.siteUrl || this.context.pageContext.web.absoluteUrl;
      const url = `_api/web/lists?$filter=Hidden eq false/`;

      const sp = (await import(/*webpackChunkName: '@pnp_sp' */ "@pnp/sp"));
      const web = new sp.Web(siteUrl, url);

      const response = await web.get();
      this.options = await response.map((list: IODataList) => {
        return {key: list.Id, text: list.Title};
      });
      this.isSiteFound = true;

      await this.context.propertyPane.refresh();
      await this.render();

    } catch (err) {
      if (this.isSiteFound) {
        console.error("loadOptions", err);
        this.isSiteFound = false;
        this.render();
      }
    }
  }


  public loadItems = async (): Promise<void> => {
    try {
      const {
        list,
        numberOfItems = 5,
        ODataFilter
      } = this.properties;
      if (!list) return null;

      const siteUrl = this.properties.siteUrl || this.context.pageContext.web.absoluteUrl;
      const url = `/_api/web/lists/getbyid('${list}')/items?$top=${numberOfItems}${ODataFilter ? `&$select=${ODataFilter}` : ''}`;

      const sp = (await import(/*webpackChunkName: '@pnp_sp' */ "@pnp/sp"));
      const web = new sp.Web(siteUrl, url);

      const response = await web.get();
      const items = response || [];

      return items.map(i => {
        return {Title: i.Title, ID: i.ID, Modified: i.Modified, ModifiedBy: i.ModifiedBy};
      });
    } catch (err) {
      console.error("loadItems", err);
    }
  }


  public createNewList = async (name): Promise<void> => {
    try {
      const siteUrl = this.properties.siteUrl || this.context.pageContext.web.absoluteUrl;
      const url = `/_api/web/`;


      const sp = (await import(/*webpackChunkName: '@pnp_sp' */ "@pnp/sp"));
      const web = new sp.Web(siteUrl, url);

      const response = await web.lists.add(name);
      this.properties.list = response.data.Id;

      await this.context.propertyPane.refresh();
      await this.render();
    } catch (err) {
      console.error("createNewList", err);
    }
  }


  protected onPropertyPaneFieldChanged(propertyPath: string, oldValue: any, newValue: any): void {
    switch (propertyPath) {
      case 'siteUrl':
        this.loadOptions();
        break;
    }
  }


  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    let groupFields = [
      PropertyPaneTextField('WebPartTitle', {
        label: strings.DescriptionSiteUrlFieldLabel,
        placeholder: '...',
        value: strings.WebPartTitle
      }),
      PropertyPaneTextField('siteUrl', {
        label: strings.DescriptionSiteUrlFieldLabel,
        placeholder: '...'
      }),
      PropertyPaneSlider('numberOfItems', {
        label: strings.DescriptionNumberOfItemsFieldLabel,
        min: 1,
        max: 20,
        value: 5,
        showValue: true,
        step: 1
      }),
      PropertyPaneTextField('ODataFilter', {
        label: strings.DescriptionODataFilterFieldLabel,
        placeholder: '...'
      })
    ];

    if (this.isSiteFound)
      groupFields = [
        ...groupFields,
        PropertyFieldListPicker('list',
          {
            label: strings.DescriptionListsFieldLabel,
            includeHidden: false,
            orderBy: PropertyFieldListPickerOrderBy.Title,
            onPropertyChange: this.onPropertyPaneFieldChanged.bind(this),
            properties: this.properties,
            context: this.context,
            onGetErrorMessage: null,
            deferredValidationTime: 600,
            key: 'listPickerFieldId',
            webAbsoluteUrl: this.properties.siteUrl
          }
        )
      ];

    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.PropertyPaneDescription,
              groupFields: groupFields
            }
          ]
        }
      ]
    };
  }


  public render(): void {
    const element: React.ReactElement<IWp2Props> = React.createElement(
      Wp2,
      {
        WebPartTitle: this.properties.WebPartTitle,
        list: this.properties.list,
        isSiteFound: this.isSiteFound,
        loadItems: this.loadItems,
        createNewList: this.createNewList,
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected static get dataVersion(): Version {
    return Version.parse('1.0');
  }
}
