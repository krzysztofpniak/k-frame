import {createContext} from 'react';

const throwNotSupplied = () => {
  throw 'FormContext not supplied';
};

const FormContext = createContext({
  getFieldState: throwNotSupplied,
  observable: {subscribe: throwNotSupplied},
});

export default FormContext;
