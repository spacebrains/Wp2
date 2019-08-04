declare interface IWp2WebPartStrings {
  PropertyPaneDescription: string;
  SiteSetting: string;
  DescriptionSiteUrlFieldLabel: string;
  DescriptionListsFieldLabel: string;
  DescriptionNumberOfItemsFieldLabel: string;
  DescriptionODataFilterFieldLabel: string;
  WebPartTitle: string;
  UrlNotFound: string;
  ChoiceAListOr: string;
  CreateNew: string;

}

declare module 'Wp2WebPartStrings' {
  const strings: IWp2WebPartStrings;
  export = strings;
}
