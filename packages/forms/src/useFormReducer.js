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
  compose,
  filter,
  indexBy,
  keys,
  map,
  pathOr,
  prop,
  find,
  identity,
} from 'ramda';
import {
  Observable,
  combineLatest,
  oMap,
  share,
  oFilter,
} from './micro-rx/index';
import enrichSchema from './enrichSchema';
import createContextMapper from './createContextMapper';
import useFormStateObservable from './useFormStateObservable';

const emptyObject = {};

const useFormReducer = ({
  fieldTypes,
  schema,
  errorsDisplayStrategy,
  args,
  resetOnSubmit,
  resetOnCancel,
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

  const validateForm = useCallback(
    asyncErrors =>
      compose(
        filter(f => f.error || f.asyncErrors),
        map(f => ({
          id: f.id,
          error: f.error,
          asyncError: asyncErrors[f.id] || '',
        })),
        filter(f => f.visible && mountedFieldsRef.current[f.id]),
        map(f => fieldStatesRef.current[f.id])
      )(schema),
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

  const defaultSubmitHandler = useCallback(e => {
    const asyncErrors = {};
    const model = getFormState();
    const formErrors = validateForm(asyncErrors || {});
    const syncErrors = filter(e => e.error, formErrors);
    const {submit, setSubmitDirty} = boundActionCreators;

    syncErrors.length === 0 ? submit({fields: model.fields}) : setSubmitDirty();

    if (formErrors.length > 0) {
      const erroredInput = inputRefs.current[formErrors[0].id];
      if (erroredInput) {
        erroredInput.focus();
      }
    }

    return formErrors;
  }, []);

  const nextFieldsRef = useRef(null);

  const setFieldsInt = useCallback(fields => {
    nextFieldsRef.current = fields;
  }, []);

  const handleOnChange = useCallback((value, fieldId) => {
    const {setField, setFields} = boundActionCreators;
    const fieldSchema = indexedSchema[fieldId];

    if (fieldSchema.onChange) {
      const fieldsValues = getFields();
      const currentValue = prop(fieldId, fieldsValues);
      nextFieldsRef.current = null;
      const overriddenValue =
        fieldSchema.onChange(value, {
          currentValue,
          args: argsRef.current,
          fields: fieldsValues,
          setFields: setFieldsInt,
        }) || value;
      if (nextFieldsRef.current !== null) {
        setFields({...nextFieldsRef.current, [fieldId]: overriddenValue});
      } else if (overriddenValue !== currentValue) {
        setField(fieldId, overriddenValue);
      }
    } else {
      setField(fieldId, value);
    }
  }, []);

  const mountField = useCallback(fieldId => {
    mountedFieldsRef.current[fieldId] = true;
    return () => {
      mountedFieldsRef.current[fieldId] = false;
    };
  }, []);

  const initialFieldContext = useMemo(() => ({args, fields: getFields()}), []);

  const result = useMemo(
    () => ({
      ...boundActionCreators,
      ...initialState,
      getFields,
      getTouched,
      getFormState,
      isFieldTouched,
      validateForm,
      indexedSchema,
      handleOnBlur,
      handleRefSet,
      focusFirstField,
      defaultSubmitHandler,
      handleOnChange,
      formContext: {
        getFieldState,
        observable: formContextObservable,
        mountField,
        initialFieldContext,
      },
    }),
    []
  );

  return result;
};

export default useFormReducer;
