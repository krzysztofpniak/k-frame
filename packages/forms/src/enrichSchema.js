import {withMemoContext} from '@k-frame/core';
import {always, of, unless, map, identity} from 'ramda';

const ensureArray = unless(Array.isArray, of);
const emptyObject = {};
const propsDefault = always(emptyObject);
const visibleDefault = always(true);

const enrichSchema = schema =>
  map(
    fieldSchema => ({
      ...fieldSchema,
      props: fieldSchema.props
        ? withMemoContext(fieldSchema.props, (useMemo, context) => [
            context,
            useMemo,
          ])
        : propsDefault,
      format: fieldSchema.format || identity,
      validate: fieldSchema.validate
        ? map(
            validator =>
              withMemoContext(validator, (useMemo, value, context) => [
                value,
                context,
                useMemo,
              ]),
            ensureArray(fieldSchema.validate)
          )
        : null,
      visible: fieldSchema.visible
        ? withMemoContext(fieldSchema.visible, (useMemo, context) => [
            context,
            useMemo,
          ])
        : visibleDefault,
    }),
    schema
  );

export default enrichSchema;
