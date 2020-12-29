import {always, identity, map} from 'ramda';
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

  fieldStatesRef.current = map(fieldSchema => {
    const fieldValue = fields[fieldSchema.id];
    const fieldContext = {
      fields: initialState.fields,
      args,
      rawValue: fieldValue,
    };
    const formattedValue = (indexedSchema[fieldSchema.id].format || identity)(
      fieldValue,
      fieldContext
    );
    return {
      value: formattedValue,
      rawValue: fieldValue,
      error: validateField(fieldSchema, formattedValue, fieldContext),
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
        const fieldContext = {
          fields: formState.fields,
          args,
          rawValue: fieldValue,
        };
        const formattedValue = (indexedSchema[fieldId].format || identity)(
          fieldValue,
          fieldContext
        );
        const props = fieldSchema.props
          ? fieldSchema.props(fieldContext)
          : emptyObject;

        const error = validateField(fieldSchema, formattedValue, fieldContext);

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
          value: formattedValue,
          rawValue: fieldValue,
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
