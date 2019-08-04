import * as React from 'react';
import * as strings from 'Wp2WebPartStrings';

interface IUrlNotFoundProps{

}

const UrlNotFound : React.FC<IUrlNotFoundProps> = () => {

  return (
    <section>
      <span>{strings.UrlNotFound}</span>
    </section>
  );
};

export default UrlNotFound;

