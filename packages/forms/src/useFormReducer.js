import {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';
import * as formActions from './actions';
import {
  bindActionCreators,
  KContext,
  shallowEqual,
  withMemoContext,
} from '@k-frame/core';
import {createUpdater} from './updater';
import {
  compose,
  filter,
  indexBy,
  keys,
  map,
  of,
  pathOr,
  prop,
  reduceWhile,
  unless,
  always,
  find,
} from 'ramda';

const ensureArray = unless(Array.isArray, of);
const boolWithDefault = (defaultValue, value) =>
  value != null ? value : defaultValue;
const emptyObject = {};

const enrichSchema = schema =>
  map(
    fieldSchema => ({
      ...fieldSchema,
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
        : null,
    }),
    schema
  );

const useFormReducer = ({
  fieldTypes,
  schema,
  errorsDisplayStrategy,
  args,
  resetOnSubmit,
}) => {
  const context = useContext(KContext);

  const richSchema = useMemo(() => enrichSchema(schema), []);
  const indexedSchema = useMemo(() => indexBy(prop('id'), richSchema), []);

  const reducer = useMemo(
    () => createUpdater(fieldTypes, schema, resetOnSubmit),
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

  const validateField = useCallback((fieldId, props) => {
    const model = getFormState();
    return indexedSchema[fieldId].validate
      ? reduceWhile(
          p => !p,
          (p, c) => c(model.fields[fieldId], props),
          '',
          indexedSchema[fieldId].validate
        )
      : '';
  }, []);

  const buildFieldState = useCallback(
    (id, value, props, touched, submitRequested) => {
      return {
        id,
        value,
        props,
        error: validateField(id, props),
        errorVisible: errorsDisplayStrategy({
          submitRequested: submitRequested,
          touched,
          //dirty: model.dirty[fieldId],
        }),
        touched,
        visible: !indexedSchema[id].visible || indexedSchema[id].visible(props),
      };
    },
    []
  );

  const argsRef = useRef(args);
  const inputRefs = useRef({});

  const resolveFieldProps = useCallback((id, fieldsValues) => {
    return indexedSchema[id].props
      ? indexedSchema[id].props({
          args: argsRef.current,
          fields: fieldsValues,
        })
      : emptyObject;
  }, []);

  const initialTouchedValues = useMemo(
    () => map(always(false), indexedSchema),
    []
  );

  const initialFieldsValues = useMemo(() => {
    const model = getFormState();
    return map(f => model.fields[f.id], indexedSchema);
  }, []);

  const initialFieldsProps = useMemo(() => {
    const fieldsValues = getFields();
    return map(f => resolveFieldProps(f.id, fieldsValues), indexedSchema);
  }, []);

  const fieldsValuesRef = useRef(initialFieldsValues);
  const fieldsPropsRef = useRef(initialFieldsProps);
  const touchedValuesRef = useRef(initialTouchedValues);
  const submitRequestedRef = useRef({});

  const initialFieldsStates = useMemo(
    () =>
      map(
        f =>
          buildFieldState(
            f.id,
            fieldsValuesRef.current[f.id],
            fieldsPropsRef.current[f.id],
            touchedValuesRef.current[f.id],
            false
          ),
        indexedSchema
      ),
    []
  );

  const fieldStatesRef = useRef(initialFieldsStates);

  const fieldsCallbacksRef = useRef({});

  const argsKeys = useMemo(() => keys(args), []);
  const argsValues = map(k => args[k], argsKeys);

  useEffect(() => {
    argsRef.current = args;
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

  const subscribeField = useCallback((fieldId, callback) => {
    if (fieldsCallbacksRef.current[fieldId]) {
      console.error('duplicate field detected');
    }
    fieldsCallbacksRef.current[fieldId] = callback;
  }, []);

  const getFieldsProps = useCallback(fieldsValues => {
    const fieldsProps = {};

    for (let fieldId in fieldsValues) {
      if (fieldsValues.hasOwnProperty(fieldId)) {
        const resolvedProps = resolveFieldProps(fieldId, fieldsValues);
        if (shallowEqual(fieldsPropsRef.current[fieldId], resolvedProps)) {
          fieldsProps[fieldId] = fieldsPropsRef.current[fieldId];
        } else {
          fieldsProps[fieldId] = resolvedProps;
        }
      }
    }

    return fieldsProps;
  }, []);

  const tryUpdateFields = useCallback(() => {
    const fieldsValues = getFields();
    const touchedValues = getTouched();
    const {submitRequested} = getFormState();

    const fieldsProps = getFieldsProps(fieldsValues);

    for (let fieldId in fieldsValues) {
      if (
        fieldsValues.hasOwnProperty(fieldId) &&
        fieldsCallbacksRef.current[fieldId] &&
        (fieldsValues[fieldId] !== fieldsValuesRef.current[fieldId] ||
          fieldsProps[fieldId] !== fieldsPropsRef.current[fieldId] ||
          touchedValues[fieldId] !== touchedValuesRef.current[fieldId] ||
          submitRequestedRef.current !== submitRequested)
      ) {
        const newFieldState = buildFieldState(
          fieldId,
          fieldsValues[fieldId],
          fieldsProps[fieldId],
          touchedValues[fieldId],
          submitRequested
        );
        fieldStatesRef.current[fieldId] = newFieldState;
        fieldsCallbacksRef.current[fieldId](newFieldState);
      }
    }

    submitRequestedRef.current = submitRequested;
    fieldsPropsRef.current = fieldsProps;
    fieldsValuesRef.current = fieldsValues;
    touchedValuesRef.current = touchedValues;
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
        filter(f => f.visible),
        map(f => fieldStatesRef.current[f.id])
      )(schema),
    []
  );

  useEffect(() => {
    tryUpdateFields();
  }, argsValues);

  useEffect(() => context.subscribe(tryUpdateFields), []);

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

  const handleOnChange = useCallback((value, fieldId) => {
    const {setField} = boundActionCreators;
    const fieldSchema = indexedSchema[fieldId];

    if (fieldSchema.onChange) {
      const fieldsValues = getFields();
      const currentValue = prop(fieldId, fieldsValues);
      const overriddenValue =
        fieldSchema.onChange({
          value,
          args: argsRef.current,
          fields: fieldsValues,
        }) || value;
      if (overriddenValue !== currentValue) {
        setField(fieldId, overriddenValue);
      }
    } else {
      setField(fieldId, value);
    }
  }, []);

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
        subscribeField,
        getFieldState,
      },
    }),
    []
  );

  return result;
};

export default useFormReducer;
