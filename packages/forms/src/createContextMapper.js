import {always, map} from 'ramda';
import {shallowEqual} from '@k-frame/core';
import validateField from './validateField';

const emptyObject = {};

const createContextMapper = (
  indexedSchema,
  initialState,
  errorsDisplayStrategy,
  fieldStatesRef,
  args
) => {
  const errors = map(always(''), indexedSchema);
  const fields = initialState.fields;
  const fieldContext = {fields: initialState.fields, args, fieldErrors: []};

  fieldStatesRef.current = map(
    fieldSchema => ({
      value: fields[fieldSchema.id],
      error: validateField(fieldSchema, fields[fieldSchema.id], fieldContext),
      visible: fieldSchema.visible(fieldContext),
      props: fieldSchema.props ? fieldSchema.props(fieldContext) : emptyObject,
    }),
    indexedSchema
  );

  return ([args, formState]) => {
    const fieldsStates = fieldStatesRef.current;

    for (let fieldId in indexedSchema) {
      if (indexedSchema.hasOwnProperty(fieldId)) {
        const fieldSchema = indexedSchema[fieldId];
        const fieldValue = formState.fields[fieldId];
        const fieldErrors = formState.fieldsErrors[fieldId];
        const fieldContext = {fields: formState.fields, args, fieldErrors};
        const props = fieldSchema.props
          ? fieldSchema.props(fieldContext)
          : emptyObject;

        const error = validateField(fieldSchema, fieldValue, fieldContext);

        errors[fieldId] = error;
        const touched = formState.touched[fieldId];
        const dirty = formState.dirty[fieldId];

        const errorVisible = errorsDisplayStrategy({
          submitRequested: formState.submitRequested,
          touched,
          dirty,
        });

        const newState = {
          id: fieldId,
          value: fieldValue,
          props: shallowEqual(props, fieldsStates[fieldId].props)
            ? fieldsStates[fieldId].props
            : props,
          error,
          errorVisible,
          visible: fieldSchema.visible(fieldContext),
        };

        if (!shallowEqual(fieldsStates[fieldId], newState)) {
          fieldsStates[fieldId] = newState;
        }
      }
    }

    return {args, formState, errors, fieldsStates};
  };
};

export default createContextMapper;
