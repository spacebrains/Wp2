import * as React from 'react';
import {IItems} from '../Wp2'

interface IListSelectedProps {
  items:Array<IItems>;
}

const ListSelected: React.FC<IListSelectedProps> = ({items}:IListSelectedProps) => {

  return (
    <section>
      {console.log(items)}
      <table>
        <tr>
          <th>ID</th>
          <th>Title</th>
        </tr>
        {items.map(i=>
        <tr>
          <td>{i.ID}</td>
          <td>{i.Title}</td>
        </tr>)}
      </table>
    </section>
  );
};

export default ListSelected;

