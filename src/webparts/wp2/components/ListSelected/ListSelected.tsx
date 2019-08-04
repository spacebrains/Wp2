import * as React from 'react';
import {IItems} from '../Wp2';
import {DetailsList} from "office-ui-fabric-react";

interface IListSelectedProps {
  items: Array<IItems>;
}

const ListSelected: React.FC<IListSelectedProps> = ({items}: IListSelectedProps) => {

  return (
    <>
      {(items && items.length > 0) ?
        <DetailsList items={items}/>
        : <div>list is empty</div>}
    </>
  );
};

export default ListSelected;

