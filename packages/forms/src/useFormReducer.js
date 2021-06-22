import {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';
import * as formActions from './actions';
import {bindActionCreators, KContext, shallowEqual} from '@k-frame/core';
import createFormReducer from './createFormReducer';
import {
  filter,
  find,
  identity,
  ifElse,
  indexBy,
  keys,
  map,
  pathOr,
  pluck,
  prop,
  propEq,
  unless,
} from 'ramda';
import {
  combineLatest,
  Observable,
  oFilter,
  oMap,
  share,
} from './micro-rx/index';
import enrichSchema from './enrichSchema';
import createContextMapper from './createContextMapper';
import useFormStateObservable from './useFormStateObservable';
import {
  after,
  and,
  attempt,
  bichain,
  bimap,
  chain,
  coalesce,
  encase,
  fork,
  hook,
  isFuture,
  parallel,
  reject,
  resolve,
} from 'fluture';
import validateField from './validateField';

const emptyObject = {};
const emptyArray = [];

const useFormReducer = ({
  fieldTypes,
  schema,
  errorsDisplayStrategy,
  args,
  resetOnSubmit,
  resetOnCancel,
  formRefCreator,
}) => {
  const context = useContext(KContext);

  const richSchema = useMemo(() => enrichSchema(schema), []);
  const indexedSchema = useMemo(() => indexBy(prop('id'), richSchema), []);

  const reducer = useMemo(
    () => createFormReducer(fieldTypes, schema, resetOnSubmit, resetOnCancel),
    []
  );
  //TODO: performance
  const initialState = reducer(undefined, {type: '@@INIT'});

  const getFormState = useCallback(
    () => pathOr(initialState, context.scope, context.getState()),
    []
  );

  const getFields = useCallback(
    () =>
      pathOr(
        initialState.fields,
        [...context.scope, 'fields'],
        context.getState()
      ),
    []
  );

  const argsRef = useRef(args);
  const inputRefs = useRef({});
  const fieldStatesRef = useRef({});
  const mountedFieldsRef = useRef({});

  const contextMapper = useMemo(
    () =>
      createContextMapper(
        indexedSchema,
        initialState,
        errorsDisplayStrategy,
        fieldStatesRef,
        args
      ),
    []
  );

  const argsKeys = useMemo(() => keys(args), []);
  const argsValues = map(k => args[k], argsKeys);

  const argsEmitter = useRef(() => {});

  const argsObservable = useMemo(() => {
    return Observable(observer => {
      let prevArgs = args;
      observer.next(prevArgs);
      argsEmitter.current = newArgs => {
        if (!shallowEqual(newArgs, prevArgs)) {
          observer.next(newArgs);
          prevArgs = newArgs;
        }
      };
      return () => {};
    });
  }, []);

  const formStateObservable = useFormStateObservable(
    context.subscribe,
    getFormState
  );

  const formContextObservable = useMemo(
    () =>
      share(
        oMap(
          contextMapper,
          oFilter(
            ([args, formState]) =>
              args !== null && formState !== null && formState.fields,
            combineLatest(argsObservable, formStateObservable)
          )
        )
      ),
    []
  );

  useEffect(() => {
    argsRef.current = args;
    argsEmitter.current(args);
  }, argsValues);

  useLayoutEffect(() => {
    const reducerPath = [...context.scope, '.'];
    context.assocReducer(reducerPath, reducer);
  }, []);

  const getFieldState = useCallback(id => {
    if (!fieldStatesRef.current[id]) {
      throw `Unknown field name: ${id}`;
    }
    return fieldStatesRef.current[id];
  }, []);

  const getTouched = useCallback(
    () =>
      pathOr(
        initialState.fields,
        [...context.scope, 'touched'],
        context.getState()
      ),
    []
  );

  const isFieldTouched = useCallback(fieldId => {
    const state = getFormState();
    return pathOr(false, ['touched', fieldId], state);
  }, []);

  const validateFuture = useMemo(
    () =>
      attempt(() => richSchema)
      |> map(
        map(f => ({
          id: f.id,
          fieldSchema: f,
          state: fieldStatesRef.current[f.id],
        }))
      )
      |> map(filter(f => f.state.visible && mountedFieldsRef.current[f.id]))
      |> map(
        map(f => ({
          ...f,
          context: {
            fields: getFields(),
            args: argsRef.current,
            rawValue: getFields()[f.id],
          },
        }))
      )
      |> map(
        map(f => ({
          ...f,
          errorFuture:
            f.fieldSchema.format(f.context.rawValue, f.context)
            |> unless(isFuture)(resolve)
            |> chain(
              validateField(boundActionCreators.setFieldError)(f.fieldSchema)(
                f.context
              )
            ),
        }))
      )
      |> map(
        map(
          f =>
            f.errorFuture
            |> chain(ifElse(x => x === '')(resolve)(reject))
            |> coalesce(reason => ({
              type: 'rejected',
              reason: {id: f.id, error: reason},
            }))(value => ({
              type: 'fulfilled',
              value,
            }))
        )
      )
      |> chain(parallel(4))
      |> chain(
        errors =>
          errors
          |> filter(propEq('type', 'rejected'))
          |> pluck('reason')
          |> ifElse(x => x.length > 0)(reject)(resolve)
      )
      |> and(encase(getFields)()),
    []
  );

  const handleRefSet = useCallback((ref, fieldId) => {
    inputRefs.current[fieldId] = ref;
  }, []);

  const focusFirstField = useCallback(() => {
    const firstField = find(f => inputRefs.current[f.id], schema);
    if (
      firstField &&
      inputRefs.current[firstField.id] &&
      inputRefs.current[firstField.id].focus
    ) {
      inputRefs.current[firstField.id].focus();
    }
  }, []);

  const boundActionCreators = useMemo(
    () => bindActionCreators(formActions, context.dispatch),
    []
  );

  const handleOnBlur = useCallback(fieldId => {
    const {setTouched} = boundActionCreators;
    if (!isFieldTouched(fieldId)) {
      setTouched(fieldId);
    }
  }, []);

  const defaultSubmitFuture = useMemo(() => {
    const {toggleValidating} = boundActionCreators;

    const {submit, setSubmitDirty} = boundActionCreators;

    return hook(encase(toggleValidating)(true))(() =>
      encase(toggleValidating)(false)
    )(
      () =>
        validateFuture
        |> bimap(syncErrors => {
          setSubmitDirty();

          if (syncErrors.length > 0) {
            const erroredInput = inputRefs.current[syncErrors[0].id];
            if (erroredInput && erroredInput.focus) {
              erroredInput.focus();
            }
          }

          return syncErrors;
        })(syncErrors => {
          submit({fields: getFormState().fields});
          return syncErrors;
        })
    );
  }, []);

  const nextFieldsRef = useRef(null);

  const setFieldsInt = useCallback(fields => {
    nextFieldsRef.current = fields;
  }, []);

  const taskReferences = useRef({});

  const forkLatest = useCallback(
    id => cancelCallback => {
      if (taskReferences.current[id]) {
        taskReferences.current[id]();
      }
      taskReferences.current[id] = cancelCallback;
    },
    []
  );

  const handleOnChange = useCallback((value, fieldId) => {
    const {setField, setFields} = boundActionCreators;
    const fieldSchema = indexedSchema[fieldId];
    const fieldsValues = getFields();

    if (fieldSchema.onChange) {
      const currentValue = prop(fieldId, fieldsValues);
      nextFieldsRef.current = null;
      const onChangeResult = fieldSchema.onChange(value, {
        currentValue,
        args: argsRef.current,
        fields: fieldsValues,
        setFields: setFieldsInt,
        formRef: formRefCreator(),
      });
      const overriddenValue =
        onChangeResult !== undefined ? onChangeResult : value;
      if (nextFieldsRef.current !== null) {
        setFields({...nextFieldsRef.current, [fieldId]: overriddenValue});
      } else if (overriddenValue !== currentValue) {
        setField(fieldId, overriddenValue);
      }
    } else {
      setField(fieldId, value);
    }
  }, []);

  const handleOnUpdate = useCallback((value, fieldId) => {
    const {setFormattedField, setFieldError} = boundActionCreators;
    const fieldSchema = indexedSchema[fieldId];
    const fieldsValues = getFields();

    const fieldContext = {
      fields: fieldsValues,
      args: argsRef.current,
      rawValue: value,
    };

    value
      |> after(fieldSchema.debounce || 100)
      |> chain(
        v =>
          fieldSchema.format(v, fieldContext)
          |> unless(isFuture)(v => resolve(v))
      )
      |> chain(v =>
        attempt(() => {
          setFormattedField(fieldSchema.id, v);
          return v;
        })
      )
      |> chain(validateField(setFieldError)(fieldSchema)(fieldContext))
      |> fork(identity)(identity)
      |> forkLatest(fieldId);
  }, []);

  const mountField = useCallback(fieldId => {
    mountedFieldsRef.current[fieldId] = true;
    return () => {
      mountedFieldsRef.current[fieldId] = false;
    };
  }, []);

  const initialFieldContext = useMemo(() => ({args, fields: getFields()}), []);

  return useMemo(
    () => ({
      ...boundActionCreators,
      ...initialState,
      getFields,
      getTouched,
      getFormState,
      isFieldTouched,
      validateFuture,
      indexedSchema,
      handleOnBlur,
      handleRefSet,
      focusFirstField,
      defaultSubmitFuture,
      handleOnChange,
      handleOnUpdate,
      formContext: {
        getFieldState,
        observable: formContextObservable,
        mountField,
        initialFieldContext,
      },
    }),
    []
  );
};

export default useFormReducer;
