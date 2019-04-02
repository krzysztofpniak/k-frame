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
  merge,
  prop,
  set,
} from 'ramda';
import {
  createPayloadReducer,
  createStateReducer,
  createReducer,
} from '@k-frame/core';
import {RESET, SET_FIELD, SET_SUBMIT_DIRTY, SUBMIT} from './actionTypes';

const mergeSpec = curry((spec, obj) => merge(obj, applySpec(spec)(obj)));

const getInitialModel = fields => ({
  debouncing: {},
  submitDirty: false,
  fields: fields || {},
  dirty: map(always(false), fields),
  defaultValues: fields || {},
});

const setFields = (model, fields) =>
  set(lensProp('fields'), {...model.fields, ...fields}, model);

const reset = mergeSpec({
  dirty: always(false),
  submitDirty: always(false),
  fields: prop('defaultValues'),
  subStates: prop('initialSubStates'),
});

const setFieldsAndDefaults = (model, fields) =>
  model
    .set('fields', {...model.fields, ...fields})
    .set('defaultValues', {...model.defaultValues, ...fields});

const setSubStates = (model, subStates) =>
  model.set('subStates', {...model.subStates, ...subStates});

const getFieldType = compose(
  defaultTo('text'),
  prop('type')
);

const createUpdater = (fieldTypes, schema) => {
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
    createPayloadReducer(SUBMIT, ({resetOnSubmit}) =>
      mergeSpec({
        dirty: compose(
          map(always(false)),
          prop('fields')
        ),
        submitDirty: always(false),
        fields: prop(resetOnSubmit ? 'defaultValues' : 'fields'),
        subStates: prop(resetOnSubmit ? 'initialSubStates' : 'subStates'),
      })
    ),
    createPayloadReducer(RESET, ({resetOnCancel}) =>
      mergeSpec({
        dirty: always(false),
        submitDirty: always(false),
        fields: prop(resetOnCancel ? 'defaultValues' : 'fields'),
        subStates: prop(resetOnCancel ? 'initialSubStates' : 'subStates'),
      })
    ),
    createStateReducer(SET_SUBMIT_DIRTY, assoc('submitDirty', true)),
  ]);
};

export {
  getInitialModel,
  createUpdater,
  setFields,
  setFieldsAndDefaults,
  setSubStates,
  reset,
};
