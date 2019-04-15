import {
  always,
  applySpec,
  assoc,
  compose,
  curry,
  defaultTo,
  evolve,
  filter,
  fromPairs,
  lensProp,
  map,
  mergeRight,
  prop,
} from 'ramda';
import {
  createPayloadReducer,
  createStateReducer,
  createReducer,
} from '@k-frame/core';
import {
  RESET,
  SET_FIELD,
  SET_TOUCHED,
  SET_SUBMIT_REQUESTED,
  SUBMIT,
} from './actionTypes';

const mergeSpec = curry((spec, obj) => mergeRight(obj, applySpec(spec)(obj)));

const getInitialModel = fields => ({
  submitRequested: false,
  fields: fields || {},
  dirty: map(always(false), fields),
  touched: map(always(false), fields),
  defaultValues: fields || {},
});

const reset = mergeSpec({
  dirty: always(false),
  submitRequested: always(false),
  fields: prop('defaultValues'),
  subStates: prop('initialSubStates'),
});

const getFieldType = compose(
  defaultTo('text'),
  prop('type')
);

const createUpdater = (fieldTypes, schema, resetOnSubmit) => {
  const missingTypes = filter(f => !fieldTypes[getFieldType(f)], schema);
  if (missingTypes.length > 0) {
    console.error(
      'missing types registration for following fields',
      missingTypes
    );
  }
  const fields = compose(
    fromPairs,
    map(f => [f.id, f.defaultValue || ''])
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
    createPayloadReducer(RESET, ({resetOnCancel}) =>
      mergeSpec({
        dirty: always(false),
        submitRequested: always(false),
        fields: prop(resetOnCancel ? 'defaultValues' : 'fields'),
      })
    ),
    createStateReducer(SET_SUBMIT_REQUESTED, assoc('submitRequested', true)),
  ]);
};

export {createUpdater, reset};
