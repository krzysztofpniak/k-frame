import {createAction} from '@k-frame/core';
import {
  SET_FIELD,
  SET_TOUCHED,
  SUBMIT,
  RESET,
  SET_SUBMIT_DIRTY,
} from './actionTypes';

const setField = createAction(SET_FIELD, (name, value, debounce) => ({
  name,
  value,
  debounce,
}));

const setTouched = createAction(SET_TOUCHED);
const submit = createAction(SUBMIT);
const reset = createAction(RESET);
const setSubmitDirty = createAction(SET_SUBMIT_DIRTY);

export {setField, setTouched, submit, reset, setSubmitDirty};
