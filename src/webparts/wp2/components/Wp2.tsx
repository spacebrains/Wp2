import * as React from 'react';
import ListSelected from './ListSelected/ListSelected';
import NoListSelected from './NoListSelected/NoListSelected';
import CreateNewListForm from './CreateNewListForm/CreateNewListForm';
import UrlNotFound from './UrlNotFound/UrlNotFound';
import {IPropertyPaneDropdownOption} from "@microsoft/sp-property-pane/lib";
import styles from './Wp2.module.scss';

export interface IItems {
  Title: string;
  ID: string;
}

export interface IWp2Props {
  WebPartTitle: string;
  isSiteFound: boolean;
  list: IPropertyPaneDropdownOption;
  loadItems: Function;
  createNewList: Function;
}

interface IState {
  window: 'ListSelected' | 'NoListSelected' | 'CreateNewListForm' | 'UrlNotFound';
  items: Array<IItems>;
}


export default class Wp2Part extends React.Component<IWp2Props> {
  public state: IState = {
    window: this.props.isSiteFound ?
      this.props.list ? 'ListSelected' : 'NoListSelected'
      : 'UrlNotFound',
    items: []
  };


  public componentDidUpdate(prevProps: Readonly<IWp2Props>, prevState): void {
    if (this.props !== prevProps)
      this.setNewState();
  }


  public setNewState = async (): Promise<void> => {
    const items = await this.props.loadItems();

    this.setState({
      ...this.state,
      window: this.props.isSiteFound ?
        this.props.list ? 'ListSelected' : 'NoListSelected'
        : 'UrlNotFound',
      items: items
    });
  }


  public switchWindow = () => {
    switch (this.state.window) {
      case 'ListSelected':
        return <ListSelected
          items={this.state.items}/>;
      case 'NoListSelected':
        return <NoListSelected openForm={this.openForm}/>;
      case 'CreateNewListForm':
        return <CreateNewListForm
          createNewList={this.props.createNewList}/>;
      case 'UrlNotFound':
        return <UrlNotFound/>;
    }
  }

  public openForm = () => {
    this.setState({...this.state, window: 'CreateNewListForm'});
  }


  public render(): React.ReactElement<IWp2Props> {
    return (
      <section className="Wp2">
        <h1 className={styles.h1}>{this.props.WebPartTitle}</h1>
        {this.switchWindow()}
      </section>
    );
  }
}
