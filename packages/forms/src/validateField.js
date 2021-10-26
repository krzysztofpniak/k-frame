import {reduce, unless} from 'ramda';
import {and, attempt, bichain, chain, isFuture, reject, resolve} from 'fluture';

const validateField = setFieldError => fieldSchema => fieldContext =>
  (fieldSchema.validate
    ? reduce(
        (p, c) =>
          p
          |> chain(
            () =>
              c(fieldContext.value, fieldContext)
              |> unless(isFuture)(v => (v === '' ? resolve(v) : reject(v)))
          )
          |> chain(v => (v === '' ? resolve(v) : reject(v))),
        resolve(''),
        fieldSchema.validate
      )
    : resolve(''))
  |> bichain(
    v => attempt(() => setFieldError(fieldSchema.id, v)) |> and(reject(v))
  )(() => attempt(() => setFieldError(fieldSchema.id, '')) |> and(resolve('')));
export default validateField;
