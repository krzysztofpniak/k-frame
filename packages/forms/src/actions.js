import {createAction} from '@k-frame/core';
import {
  SET_FIELD,
  SET_FIELDS,
  SET_FIELD_ERRORS,
  SET_TOUCHED,
  SUBMIT,
  RESET,
  SET_SUBMIT_REQUESTED,
} from './actionTypes';

const setField = createAction(SET_FIELD, (name, value) => ({
  name,
  value,
}));

const setFieldErrors = createAction(SET_FIELD_ERRORS, (name, errors) => ({
  name,
  errors,
}));

const setFields = createAction(SET_FIELDS);
const setTouched = createAction(SET_TOUCHED);
const submit = createAction(SUBMIT);
const reset = createAction(RESET);
const setSubmitDirty = createAction(SET_SUBMIT_REQUESTED);

export {
  setField,
  setFields,
  setFieldErrors,
  setTouched,
  submit,
  reset,
  setSubmitDirty,
};
