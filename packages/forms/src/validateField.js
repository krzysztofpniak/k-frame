import {reduceWhile} from 'ramda';

const validateField = (fieldSchema, fieldValue, fieldContext) => {
  return fieldSchema.validate
    ? reduceWhile(
        p => !p,
        (p, c) => c(fieldValue, fieldContext),
        '',
        fieldSchema.validate
      )
    : '';
};

export default validateField;
