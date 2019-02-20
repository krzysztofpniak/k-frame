import React, {
  createElement,
  useCallback,
  useMemo,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useContext,
  memo,
} from 'react';
import {
  filter,
  map,
  identity,
  find,
  addIndex,
  compose,
  mapObjIndexed,
  fromPairs,
  mergeRight,
  has,
  path,
  reduceBy,
  propOr,
  pathOr,
  keys,
  flip,
  indexBy,
  prop,
  unless,
  of,
  reduceWhile,
} from 'ramda';
import {setField, submit, reset, setSubmitDirty} from './actions';
import {createUpdater} from './updater';
import {
  fetchOnEvery,
  handleAsyncs,
  KContext,
  withScope,
  useKReducer,
  bindActionCreators,
  shallowEqual,
} from '@k-frame/core';
import {getContextValue} from '../src/formConnect';
const mapWithKey = addIndex(map);

const ensureArray = unless(Array.isArray, of);

const mergeProps = propName => props => ({
  ...props,
  ...props[propName],
  [propName]: null,
});

const validateField = (fieldSchema, model, args) =>
  fieldSchema.validate
    ? reduceWhile(
        p => !p,
        (p, c) =>
          c(model.fields[fieldSchema.id], {
            fields: model.fields,
            args,
            fieldSchema,
            debouncing: !!model.debouncing[fieldSchema.id],
          }),
        '',
        ensureArray(fieldSchema.validate)
      )
    : '';

const validateForm = (schema, model, asyncErrors, args) =>
  compose(
    filter(f => f.error || f.asyncErrors),
    map(f => ({
      id: f.id,
      error: validateField(f, model, args),
      asyncError: asyncErrors[f.id] || '',
    })),
    filter(f => !f.visible || f.visible(model.fields))
  )(schema);

const boolWithDefault = (defaultValue, value) =>
  value != null ? value : defaultValue;

const GenericError = ({content}) => (
  <div className="alert alert-danger" role="alert">
    {content}
  </div>
);

const useFrozenReducer = (reducer, actions) => {
  const context = useContext(KContext);

  useLayoutEffect(() => {
    const reducerPath = [...context.scope, '.'];
    context.assocReducer(reducerPath, reducer);
    return () => {
      context.dissocReducer(reducerPath);
    };
  }, []);

  const getFields = useCallback(
    () => pathOr({}, [...context.scope, 'fields'], context.getState()),
    []
  );

  //TODO: performance
  const initialState = reducer(undefined, {type: '@@INIT'});

  const result = useMemo(
    () => ({
      ...bindActionCreators(actions, context.dispatch),
      ...initialState,
      getFields,
    }),
    []
  );

  return result;
};

const formActions = {
  setField,
  setSubmitDirty,
  submit,
};

const Field = memo(
  ({
    id,
    type,
    formGroupTemplate,
    formName,
    title,
    onChange,
    component,
    fieldSchema,
    inputRef,
    error,
    props,
  }) => {
    const context = useContext(KContext);

    const [state, setState] = useState(
      pathOr(
        fieldSchema.defaultValue || '',
        [...context.scope, 'fields', id],
        context.getState()
      )
    );

    const stateRef = useRef(state);

    useLayoutEffect(() => {
      return context.subscribe(() => {
        const newState = path(
          [...context.scope, 'fields', id],
          context.getState()
        );
        if (newState !== stateRef.current) {
          setState(newState);
          stateRef.current = newState;
        }
      });
    }, []);

    const propsKeys = useMemo(() => keys(props), []);
    const propsValues = map(k => props[k], propsKeys);

    const formattedValue = useMemo(
      () => (fieldSchema.format ? fieldSchema.format(state) : state),
      [state]
    );

    const handleOnChange = useCallback(
      e => {
        const value = !e.target ? e : e.target.value;
        const parsedValue = fieldSchema.parse
          ? fieldSchema.parse(value)
          : value;

        onChange(parsedValue, id);
      },
      [id, onChange]
    );

    const handleRefSet = useCallback(
      ref => {
        inputRef(ref, id);
      },
      [id, inputRef]
    );

    const field = useMemo(
      () => {
        return createElement(formGroupTemplate, {
          title,
          input: createElement(component, {
            id: (formName || '') + (formName ? '-' : '') + id,
            title,
            inputRef: handleRefSet,
            /*value:
            fields[
              f.debounce && has(`${f.id}_raw`, fields) ? `${f.id}_raw` : f.id
            ],
            */
            value: formattedValue,
            onChange: handleOnChange,
            type,
            error,
            //runValidation: model.submitDirty && model.dirty,
            scope: `sub.${id}`,
            ...(props || {}),
          }),
          error,
        });
      },
      [state, error, ...propsValues]
    );

    return field;
  },
  (props, nextProps) =>
    shallowEqual(mergeProps('props')(props), mergeProps('props')(nextProps))
);

const emptyObject = {};

const FormInt = compose(
  flip(memo)((props, nextProps) =>
    shallowEqual(mergeProps('args')(props), mergeProps('args')(nextProps))
  ),
  withScope
)(
  ({
    name,
    legend,
    formTemplate,
    formGroupTemplate,
    buttonsTemplate,
    onSubmit,
    onReset,
    fieldTypes,
    schema,
    resetOnSubmit,
    cancelText,
    submitText,
    additionalButtons,
    args,
    autoFocus,
  }) => {
    const context = useContext(KContext);
    const argsKeys = useMemo(() => keys(args), []);
    const argsValues = map(k => args[k], argsKeys);

    const reducer = useMemo(() => createUpdater(fieldTypes, schema), []);
    const {setField, submit, setSubmitDirty, getFields} = useFrozenReducer(
      reducer,
      formActions
    );

    const [syncErrors, setSyncErrors] = useState({});

    const getFieldsValues = useCallback(() => {
      const appState = context.getState();
      const fieldsValues = pathOr({}, [...context.scope, 'fields'], appState);
      return fieldsValues;
    }, []);

    const argsRef = useRef(args);
    useEffect(() => {
      argsRef.current = args;
    }, argsValues);

    const fieldsValuesRef = useRef({});
    const syncErrorsRef = useRef({});

    const inputRefs = useRef({});

    const indexedSchema = useMemo(() => indexBy(prop('id'), schema), []);

    const getSyncErrors = useCallback(
      () => {
        const model = pathOr(
          {fields: {}, debouncing: {}},
          context.scope,
          context.getState()
        );

        return map(
          fieldSchema => validateField(fieldSchema, model, argsRef.current),
          indexedSchema
        );
      },
      [indexedSchema]
    );

    const validateFields = useCallback(() => {
      const syncErrorsCandidate = getSyncErrors();

      if (!shallowEqual(syncErrorsCandidate, syncErrorsRef.current)) {
        syncErrorsRef.current = syncErrorsCandidate;
        setSyncErrors(syncErrorsCandidate);
      }
    }, []);

    useEffect(() => {
      validateFields();
    }, argsValues);

    useEffect(() => {
      if (autoFocus) {
        const firstField = find(f => inputRefs.current[f.id], schema);
        if (
          firstField &&
          inputRefs.current[firstField.id] &&
          inputRefs.current[firstField.id].focus
        ) {
          inputRefs.current[firstField.id].focus();
        }
      }

      return context.subscribe(() => {
        const fieldsValues = getFieldsValues();
        if (!shallowEqual(fieldsValues, fieldsValuesRef.current)) {
          fieldsValuesRef.current = fieldsValues;
          validateFields();
        }
      });
    }, []);

    const defaultSubmitHandler = useCallback(e => {
      const asyncErrors = {};
      const model = pathOr({}, context.scope, context.getState());
      const formErrors = validateForm(
        schema,
        model,
        asyncErrors || {},
        argsRef.current
      );
      const syncErrors = filter(e => e.error, formErrors);

      syncErrors.length === 0
        ? submit({
            fields: model.fields,
            resetOnSubmit: boolWithDefault(true, resetOnSubmit),
          })
        : setSubmitDirty();

      if (formErrors.length > 0) {
        const erroredInput = inputRefs.current[formErrors[0].id];
        if (erroredInput) {
          erroredInput.focus();
        }
      }

      return formErrors;
    }, []);

    const defaultResetHandler = useCallback(() => {}, []);

    const handleSubmit = useCallback(
      e => {
        e.preventDefault();
        return onSubmit
          ? onSubmit(defaultSubmitHandler, getFields())
          : defaultSubmitHandler();
      },
      [defaultSubmitHandler, onSubmit]
    );

    const handleReset = useCallback(e => {
      e.preventDefault();
      return onReset ? onReset(defaultResetHandler) : defaultResetHandler();
    });

    const setFieldValue = useCallback((value, id) => {
      //const model = this.getModel();
      //const fields = indexedSchemaSelector(model, this.props);
      /*const field = fields[id];
      if (field.debounce) {
        setField(id, value, 'start');
        clearTimeout(this.timeouts[id]);
        this.timeouts[id] = setTimeout(
          () => setField(id, value, 'end'),
          field.debounce
        );
      } else {*/
      setField(id, value);
      //}
    });

    const handleOnChange = useCallback((value, fieldId) => {
      const fieldSchema = indexedSchema[fieldId];

      if (fieldSchema.onChange) {
        const appState = context.getState();
        const fieldsValues = pathOr({}, [...context.scope, 'fields'], appState);
        const currentValue = prop(fieldId, fieldsValues);
        const overriddenValue =
          fieldSchema.onChange({
            value,
            args: argsRef.current,
            fields: fieldsValues,
          }) || value;
        if (overriddenValue !== currentValue) {
          setFieldValue(overriddenValue, fieldId);
        }
      } else {
        setFieldValue(value, fieldId);
      }
    }, []);

    const handleRefSet = useCallback((ref, fieldId) => {
      inputRefs.current[fieldId] = ref;
    }, []);

    const buttons = useMemo(
      () =>
        createElement(buttonsTemplate, {
          onSubmit: handleSubmit,
          onReset: handleReset,
          formName: name,
          cancelText,
          submitText,
          dirty: false,
        }),
      [buttonsTemplate, handleSubmit, name, cancelText, submitText]
    );
    const genericError = <div>genericError</div>;

    const groupFields = useCallback(
      (acc, f) =>
        acc.concat(
          <Field
            key={(name || '') + (name ? '-' : '') + f.id}
            id={f.id}
            inputRef={handleRefSet}
            error={syncErrorsRef.current[f.id]}
            title={f.title}
            formGroupTemplate={formGroupTemplate}
            formName={name}
            onChange={handleOnChange}
            fieldSchema={f}
            type={f.type || 'text'}
            component={fieldTypes[f.type || 'text']}
            props={f.props ? f.props(args) : emptyObject}
          />
        ),
      [formGroupTemplate, fieldTypes, name, ...argsValues]
    );

    const renderedFields = useMemo(
      () => reduceBy(groupFields, [], propOr('default', 'group'), schema),
      [schema, syncErrors, ...argsValues]
    );

    const renderedForm = useMemo(
      () =>
        createElement(formTemplate, {
          fields: renderedFields,
          buttons,
          genericError,
          legend,
          onSubmit: handleSubmit,
          args,
        }),
      [buttons, renderedFields, ...argsValues]
    );

    return renderedForm;
  }
);

const Form = props => {
  const context = useContext(KContext);
  const contextValue = useMemo(() => getContextValue(), []);

  if (!context.supplied) {
    return (
      <KContext.Provider value={contextValue}>
        {createElement(FormInt, props)}
      </KContext.Provider>
    );
  }

  return createElement(FormInt, props);
};

const FormTemplate = ({fields, buttons, onSubmit}) => (
  <form>
    {fields.default} {buttons}
  </form>
);

const FormGroupTemplate = ({title, input, error}) => (
  <div>
    <div>
      {title} {input}
    </div>
    <div style={{color: 'red'}}>{error}</div>
  </div>
);

const ButtonsTemplate = ({onSubmit, onReset}) => (
  <div>
    <button type="submit" onClick={onSubmit}>
      Save
    </button>
    <button type="button" onClick={onReset}>
      Cancel
    </button>
  </div>
);

const fieldTypes = {
  text: ({value, onChange}) => <input value={value} onChange={onChange} />,
};

Form.defaultProps = {
  formTemplate: FormTemplate,
  formGroupTemplate: FormGroupTemplate,
  buttonsTemplate: ButtonsTemplate,
  fieldTypes: fieldTypes,
  cancelText: 'Cancel',
  submitText: 'Submit',
};

export {validateForm, validateField, Form};

