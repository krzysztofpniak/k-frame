import {createAction} from '@k-frame/core';
import {SET_FIELD, SUBMIT, RESET, SET_SUBMIT_DIRTY} from './actionTypes';

const setField = createAction(SET_FIELD, (name, value, debounce) => ({
  name,
  value,
  debounce,
}));
const submit = createAction(SUBMIT);
const reset = createAction(RESET);
const setSubmitDirty = createAction(SET_SUBMIT_DIRTY);

export {setField, submit, reset, setSubmitDirty};
