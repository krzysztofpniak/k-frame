import {createAction} from '@k-frame/core';
import {
  INIT,
  SET_FIELD,
  SET_FIELDS,
  SET_TOUCHED,
  SUBMIT,
  RESET,
  SET_SUBMIT_REQUESTED,
} from './actionTypes';

const setField = createAction(SET_FIELD, (name, value) => ({
  name,
  value,
}));

const init = createAction(INIT);
const setFields = createAction(SET_FIELDS);
const setTouched = createAction(SET_TOUCHED);
const submit = createAction(SUBMIT);
const reset = createAction(RESET);
const setSubmitDirty = createAction(SET_SUBMIT_REQUESTED);

export {init, setField, setFields, setTouched, submit, reset, setSubmitDirty};
