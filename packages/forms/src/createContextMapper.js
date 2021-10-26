import {always, map} from 'ramda';
import {shallowEqual} from '@k-frame/core';

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

  fieldStatesRef.current = map(fieldSchema => {
    const fieldValue = fields[fieldSchema.id];
    const formattedValue = initialState.formattedFields[fieldSchema.id];
    const error = initialState.errors[fieldSchema.id];
    const fieldContext = {
      fields: initialState.fields,
      args,
      value: fieldValue,
    };

    return {
      formattedValue,
      value: fieldValue,
      error,
      visible: fieldSchema.visible(fieldContext),
      props: fieldSchema.props ? fieldSchema.props(fieldContext) : emptyObject,
    };
  }, indexedSchema);

  return ([args, formState]) => {
    const fieldsStates = fieldStatesRef.current;

    for (let fieldId in indexedSchema) {
      if (indexedSchema.hasOwnProperty(fieldId)) {
        const fieldSchema = indexedSchema[fieldId];
        const fieldValue = formState.fields[fieldId];
        const formattedValue = formState.formattedFields[fieldId];
        const error = formState.errors[fieldId];
        const fieldContext = {
          fields: formState.fields,
          args,
          value: fieldValue,
        };

        const props = fieldSchema.props
          ? fieldSchema.props(fieldContext)
          : emptyObject;

        const touched = formState.touched[fieldId];
        const dirty = formState.dirty[fieldId];

        const errorVisible = errorsDisplayStrategy({
          submitRequested: formState.submitRequested,
          validating: formState.validating,
          touched,
          dirty,
        });

        const newState = {
          id: fieldId,
          formattedValue,
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

    return {args, formState, fieldsStates};
  };
};

export default createContextMapper;
