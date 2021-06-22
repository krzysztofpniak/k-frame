import {
  always,
  assoc,
  compose,
  evolve,
  filter,
  fromPairs,
  map,
  prop,
  propOr,
  mergeLeft,
} from 'ramda';
import {
  createPayloadReducer,
  createStateReducer,
  createReducer,
} from '@k-frame/core';
import {
  RESET,
  SET_FIELD,
  SET_FIELDS,
  SET_TOUCHED,
  SET_SUBMIT_REQUESTED,
  SUBMIT,
  INIT,
  TOGGLE_VALIDATING,
  SET_FORMATTED_FIELD,
  SET_FIELD_ERROR,
} from './actionTypes';
import mergeSpec from './mergeSpec';

const getInitialModel = fields => ({
  submitRequested: false,
  fields: fields || {},
  formattedFields: map(always(null), fields),
  errors: map(always(''), fields),
  dirty: map(always(false), fields),
  touched: map(always(false), fields),
  defaultValues: fields || {},
  validating: false,
});

const getFieldType = propOr('text', 'type');

const createUpdater = (fieldTypes, schema, resetOnSubmit, resetOnCancel) => {
  const missingTypes = filter(f => !fieldTypes[getFieldType(f)], schema);
  if (missingTypes.length > 0) {
    console.error(
      'missing types registration for following fields',
      missingTypes
    );
  }
  const fields = compose(
    fromPairs,
    map(f => [f.id, f.defaultValue !== undefined ? f.defaultValue : ''])
  )(schema);
  const initialModel = getInitialModel(fields);

  return createReducer(initialModel, [
    createPayloadReducer(SET_FIELD, ({name, value}) =>
      evolve({
        dirty: {
          [name]: always(true),
        },
        fields: {
          [name]: always(value),
        },
      })
    ),
    createPayloadReducer(SET_FORMATTED_FIELD, ({name, value}) =>
      evolve({
        formattedFields: {
          [name]: always(value),
        },
      })
    ),
    createPayloadReducer(SET_FIELD_ERROR, ({name, value}) =>
      evolve({
        errors: {
          [name]: always(value),
        },
      })
    ),
    createPayloadReducer(SET_FIELDS, fields =>
      evolve({
        fields: mergeLeft(fields),
      })
    ),
    createPayloadReducer(INIT, fields =>
      evolve({
        fields: always(fields),
        defaultValues: always(fields),
        dirty: always(map(always(false), fields)),
        touched: always(map(always(false), fields)),
        submitRequested: always(false),
      })
    ),
    createPayloadReducer(SET_TOUCHED, fieldId =>
      evolve({
        touched: {
          [fieldId]: always(true),
        },
      })
    ),
    createStateReducer(
      SUBMIT,
      mergeSpec({
        dirty: compose(
          map(always(false)),
          prop('fields')
        ),
        submitRequested: always(false),
        touched: compose(
          map(always(false)),
          prop('fields')
        ),
        fields: prop(resetOnSubmit ? 'defaultValues' : 'fields'),
      })
    ),
    createStateReducer(
      RESET,
      mergeSpec({
        dirty: compose(
          map(always(false)),
          prop('fields')
        ),
        touched: compose(
          map(always(false)),
          prop('fields')
        ),
        submitRequested: always(false),
        fields: prop(resetOnCancel ? 'defaultValues' : 'fields'),
      })
    ),
    createStateReducer(SET_SUBMIT_REQUESTED, assoc('submitRequested', true)),
    createPayloadReducer(TOGGLE_VALIDATING, assoc('validating')),
  ]);
};

export default createUpdater;
