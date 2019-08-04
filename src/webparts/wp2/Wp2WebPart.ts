import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import {
  IPropertyPaneConfiguration,
  IPropertyPaneDropdownOption,
  PropertyPaneDropdown,
  PropertyPaneSlider,
  PropertyPaneTextField,
} from '@microsoft/sp-property-pane';
import { PropertyFieldListPicker,
  PropertyFieldListPickerOrderBy } from '@pnp/spfx-property-controls/lib/PropertyFieldListPicker'
import {IODataList} from '@microsoft/sp-odata-types';
import {SPHttpClient} from '@microsoft/sp-http';
import * as strings from 'Wp2WebPartStrings';
import Wp2 from './components/Wp2';
import { IWp2Props } from './components/Wp2';

export interface IWp2WebPartProps {
  WebPartTitle:string
  siteUrl: string;
  list: IPropertyPaneDropdownOption;
  numberOfItems: number;
  ODataFilter: string;
}

type IOptions = Array<IPropertyPaneDropdownOption>;

export default class Wp2WebPart extends BaseClientSideWebPart<IWp2WebPartProps> {
  private options: IOptions = [];
  private isSiteFound: boolean = true;
  private selectedKey: string | number;

  protected onInit(): Promise<void> {
    console.log("onInit");
    return this.loadOptions();
  }

  public loadOptions = async (): Promise<void> => {
    try {
      console.log("loadOptions");
      const context = this.context;
      const siteUrl = this.properties.siteUrl || '';

      let url = siteUrl + `/_api/web/lists?$filter=Hidden eq false`;
      const response = await context.spHttpClient.get(url, SPHttpClient.configurations.v1);
      const json = await response.json();
      this.options = await json.value.map((list: IODataList) => {
        return {key: list.Id, text: list.Title}
      });
      this.isSiteFound = true;

      await this.context.propertyPane.refresh();
      await this.render();

    } catch (err) {
      if (this.isSiteFound) {
        this.isSiteFound = false;
        this.render();
      }
    }
  };


  public loadItems = async (): Promise<void> => {
    try {
      console.log("loadItems");
      const {
        siteUrl,
        list,
        numberOfItems=5,
        ODataFilter
      } = this.properties;
      const context = this.context;
      if (!list) return null;
      const url = `${siteUrl || ''}/_api/web/lists/getbyid('${list}')/items?$top=${numberOfItems}${ODataFilter ? `&$select=${ODataFilter}` : ''}`;

      const response = await context.spHttpClient.get(url, SPHttpClient.configurations.v1);
      const json = await response.json();
      const items = json.value || [];
      console.log("json", items.value);
      return items.map(i => {
        return {Title: i.Title, ID: i.ID}
      });
    } catch (err) {
      console.error("loadItems", err);
    }
  };


  public createNewList = async (): Promise<void> => {
    try {
      console.log("createNewList");
      const context = this.context;
      const siteUrl = this.properties.siteUrl;

      const url = `${siteUrl || ''}/_api/web/lists/`;
      const body = {
        'Title': name,
        'BaseTemplate': 100,
        '__metadata': {'type': 'SP.List'}
      };
      const response = await context.spHttpClient.post(url, SPHttpClient.configurations.v1, {
          headers: {
            "accept": "application/json;odata=verbose",
            "content-type": "application/json;odata=verbose",
            "odata-version": ""
          },
          body: JSON.stringify(body)
        }
      );
      let json = await response.json();
      this.properties.list = json.d.Id;

      await this.context.propertyPane.refresh();
      await this.render();
    } catch (err) {
      console.error("createNewList", err);
    }
  };


  protected onPropertyPaneFieldChanged(propertyPath: string, oldValue: any, newValue: any): void {
    console.log("onPropertyPaneFieldChanged");
    switch (propertyPath) {
      case 'siteUrl':
        this.loadOptions();
        break;
    }
  }


  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    console.log("getPropertyPaneConfiguration");

    let groupFields = [
      PropertyPaneTextField('WebPartTitle', {
        label: strings.DescriptionSiteUrlFieldLabel,
        placeholder: '...',
        value:strings.WebPartTitle
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
      groupFields = [...groupFields, PropertyPaneDropdown('list', {
        label: strings.DescriptionListsFieldLabel,
        options: this.options,
        selectedKey: this.selectedKey,
      })];


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
    }
  };

  public render(): void {
    const element: React.ReactElement<IWp2Props > = React.createElement(
      Wp2,
      {
        WebPartTitle:this.properties.WebPartTitle,
        list: this.properties.list,
        isSiteFound: this.isSiteFound,
        loadItems: this.loadItems,
        createNewList: this.createNewList,
        ODataFilter:this.properties.ODataFilter
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
