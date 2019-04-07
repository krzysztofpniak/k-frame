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
import {
  Observable,
  combineLatest,
  oMap,
  share,
  oFilter,
} from './micro-rx/index';

const ensureArray = unless(Array.isArray, of);
const boolWithDefault = (defaultValue, value) =>
  value != null ? value : defaultValue;
const emptyObject = {};

const propsDefault = always(emptyObject);
const visibleDefault = always(true);

const enrichSchema = schema =>
  map(
    fieldSchema => ({
      ...fieldSchema,
      props: fieldSchema.props ? fieldSchema.props : propsDefault,
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

const createContextMapper = (
  indexedSchema,
  initialState,
  errorsDisplayStrategy,
  fieldStatesRef,
  args
) => {
  const errors = map(always(''), indexedSchema);
  const fields = initialState.fields;
  const fieldContext = {fields: initialState.fields, args};

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
    const fieldContext = {fields: formState.fields, args};
    for (let fieldId in formState.fields) {
      if (formState.fields.hasOwnProperty(fieldId)) {
        const fieldSchema = indexedSchema[fieldId];
        const fieldValue = formState.fields[fieldId];

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

const useFormStateObservable = (subscribe, getFormState) => {
  const observer = useRef({});

  useEffect(() => {
    let prevState = getFormState();
    observer.current.next(prevState);
    return subscribe(() => {
      const newState = getFormState();
      if (newState !== prevState) {
        observer.current.next(newState);
        prevState = newState;
      }
    });
  }, []);

  const observable = useMemo(
    () =>
      Observable(o => {
        observer.current = o;
      }),
    []
  );

  return observable;
};

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

  const argsRef = useRef(args);
  const inputRefs = useRef({});
  const fieldStatesRef = useRef({});

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
        filter(f => f.visible),
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
        getFieldState,
        observable: formContextObservable,
      },
    }),
    []
  );

  return result;
};

export default useFormReducer;
