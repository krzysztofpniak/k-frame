import {createContext} from 'react';

const throwNotSupplied = () => {
  throw 'FormContext not supplied';
};

const FormContext = createContext({
  getFieldState: throwNotSupplied,
  subscribeField: throwNotSupplied,
});

export default FormContext;
