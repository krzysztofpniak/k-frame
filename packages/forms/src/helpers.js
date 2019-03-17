import {assoc, compose, dissoc, omit} from 'ramda';

const getValue = (valueField, option) =>
  valueField ? option[valueField] : option;

const setGeneralError = assoc('__general');

const clearGeneralError = dissoc('__general');

const addValueParam = action => (value, ...args) => {
  const actionResult = action(...args);
  return {
    ...actionResult,
    setField: {
      value,
    },
  };
};

export {getValue, setGeneralError, clearGeneralError, addValueParam};
