import {createAction} from '@k-frame/core';
import {
  INIT,
  SET_FIELD,
  SET_FORMATTED_FIELD,
  SET_FIELDS,
  SET_TOUCHED,
  SUBMIT,
  RESET,
  SET_SUBMIT_REQUESTED,
  TOGGLE_VALIDATING,
  SET_FIELD_ERROR,
} from './actionTypes';

const setField = createAction(SET_FIELD, (name, value) => ({
  name,
  value,
}));

const setFormattedField = createAction(SET_FORMATTED_FIELD, (name, value) => ({
  name,
  value,
}));

const setFieldError = createAction(SET_FIELD_ERROR, (name, value) => ({
  name,
  value,
}));

const init = createAction(INIT);
const setFields = createAction(SET_FIELDS);
const setTouched = createAction(SET_TOUCHED);
const submit = createAction(SUBMIT);
const reset = createAction(RESET);
const setSubmitDirty = createAction(SET_SUBMIT_REQUESTED);
const toggleValidating = createAction(TOGGLE_VALIDATING);

export {
  init,
  setField,
  setFormattedField,
  setFieldError,
  setFields,
  setTouched,
  submit,
  reset,
  setSubmitDirty,
  toggleValidating,
};
