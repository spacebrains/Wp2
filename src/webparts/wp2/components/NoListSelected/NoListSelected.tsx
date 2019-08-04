import * as React from 'react';
import * as strings from 'Wp2WebPartStrings';


interface INoListSelectedProps {
  openForm: Function;
}

const NoListSelected: React.FC<INoListSelectedProps> = ({openForm}: INoListSelectedProps) => {
  return (
    <span>
      {strings.ChoiceAListOr}
      <button onClick={() => openForm()}>{strings.CreateNew}</button>
    </span>
  );
};

export default NoListSelected;

