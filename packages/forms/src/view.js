import React, {
  createElement,
  useCallback,
  useMemo,
  useEffect,
  useRef,
  useContext,
  memo,
  useLayoutEffect,
  useState,
  forwardRef,
  useImperativeHandle,
  createRef,
} from 'react';
import {
  map,
  fromPairs,
  reduceBy,
  pathOr,
  keys,
  flip,
  lens,
  lensPath,
  over,
  path,
  mergeLeft,
  always,
  tap,
  compose,
  propOr,
  indexBy,
  prop,
} from 'ramda';
import useFormReducer from './useFormReducer';
import {KContext, withScope, shallowEqual} from '@k-frame/core';
import FormContext from './FormContext';
import {getPlainReduxKContextValue} from './formReducer';
import mergeProps from './mergeProps';
import Field from './field';
import FormTemplateProxy from './formTemplateProxy';
import {fieldTouchedStrategy} from './errorsDisplayStrategies';
import {distinctUntilChanged, oMap} from './micro-rx/index';

const GenericError = ({content}) => (
  <div className="alert alert-danger" role="alert">
    {content}
  </div>
);

const getDefaultValues = compose(
  map(propOr('', 'defaultValue')),
  indexBy(prop('id'))
);

const FormInt = withScope(
  forwardRef(
    (
      {
        name,
        legend,
        formTemplate,
        formTemplateProps,
        fieldTemplate,
        buttonsTemplate,
        onSubmit,
        onValidated,
        onReset,
        fieldTypes,
        schema,
        resetOnSubmit,
        resetOnCancel,
        cancelText,
        submitText,
        additionalButtons,
        args,
        autoFocus,
        errorsDisplayStrategy,
        disabled,
      },
      ref
    ) => {
      const argsKeys = useMemo(() => keys(args), []);
      const argsValues = map(k => args[k], argsKeys);

      const {
        handleOnBlur,
        handleRefSet,
        getFields,
        reset,
        init,
        formContext,
        handleOnChange,
        focusFirstField,
        validating,
        defaultSubmitHandler,
        validateForm,
        setField,
        setFields,
      } = useFormReducer({
        fieldTypes,
        schema,
        errorsDisplayStrategy,
        args,
        resetOnSubmit,
        resetOnCancel,
      });

      const argsRef = useRef(args);
      useEffect(() => {
        argsRef.current = args;
      }, argsValues);

      useEffect(() => {
        if (autoFocus) {
          focusFirstField();
        }
      }, []);

      const defaultResetHandler = useCallback(() => {
        reset();
      }, []);

      const handleReset = useCallback(
        e => {
          e.preventDefault();
          return onReset ? onReset(defaultResetHandler) : defaultResetHandler();
        },
        [onReset]
      );

      const handleSubmit = useCallback(
        e => {
          e.preventDefault();

          const callOnValidated = () =>
            defaultSubmitHandler().then(
              tap(errors => {
                if (errors.length === 0 && onValidated) {
                  onValidated(getFields());
                }
              })
            );

          return onSubmit
            ? onSubmit(callOnValidated, getFields())
            : callOnValidated();
        },
        [defaultSubmitHandler, onSubmit, onValidated]
      );

      const clear = useCallback(() => init(getDefaultValues(schema)), [schema]);

      useImperativeHandle(ref, () => ({
        submit: handleSubmit,
        getFields,
        setField,
        setFields,
        reset,
        clear,
        validate: validateForm,
      }));

      const buttons = useMemo(
        () =>
          createElement(buttonsTemplate, {
            onSubmit: handleSubmit,
            onReset: handleReset,
            formName: name,
            cancelText,
            submitText,
            dirty: false,
            disabled,
            validating,
          }),
        [
          buttonsTemplate,
          handleSubmit,
          name,
          cancelText,
          submitText,
          disabled,
          validating,
        ]
      );
      const genericError = <div>genericError</div>;

      const fieldsElements = useMemo(
        () =>
          map(
            f => [
              f,
              <Field
                key={(name || '') + (name ? '-' : '') + f.id}
                id={f.id}
                inputRef={handleRefSet}
                title={f.title}
                fieldTemplate={fieldTemplate}
                formName={name}
                onChange={handleOnChange}
                onBlur={handleOnBlur}
                defaultValue={f.defaultValue}
                parse={f.parse}
                format={f.format}
                type={f.type || 'text'}
                component={fieldTypes[f.type || 'text']}
                disabled={disabled}
              />,
            ],
            schema
          ),
        [schema, disabled]
      );

      const groupFields = useCallback((acc, [f, e]) => acc.concat(e), [
        fieldTemplate,
        name,
      ]);

      const groupedFields = useMemo(
        () =>
          reduceBy(
            groupFields,
            [],
            pathOr('default', [0, 'group']),
            fieldsElements
          ),
        [fieldsElements]
      );

      const [fieldsVisibility, setFieldsVisibility] = useState({});

      const indexedFields = useMemo(
        () =>
          fromPairs(
            map(
              ([f, e]) => [f.id, fieldsVisibility[f.id] !== false ? e : null],
              fieldsElements
            )
          ),
        [fieldsElements, fieldsVisibility]
      );

      useLayoutEffect(() => {
        const updateField = state => {
          setFieldsVisibility(state);
        };

        return distinctUntilChanged(
          oMap(({fieldsStates}) => {
            return map(e => e.visible, fieldsStates);
          }, formContext.observable)
        ).subscribe(updateField);
      }, []);

      const renderedForm = useMemo(
        () => (
          <FormContext.Provider value={formContext}>
            {createElement(FormTemplateProxy, {
              formTemplate,
              formTemplateProps,
              fields: groupedFields,
              indexedFields,
              buttons,
              genericError,
              legend,
              onSubmit: handleSubmit,
              onReset: handleReset,
              disabled,
            })}
          </FormContext.Provider>
        ),
        [buttons, groupedFields, indexedFields, disabled]
      );

      return renderedForm;
    }
  )
);

const Form = flip(memo)((props, nextProps) =>
  shallowEqual(mergeProps('args')(props), mergeProps('args')(nextProps))
)(
  forwardRef((props, ref) => {
    if (!props.schema) {
      console.error('Schema prop is required');
      return null;
    }

    const context = useContext(KContext);
    const contextValue = useMemo(() => getPlainReduxKContextValue(), []);

    if (!context.supplied) {
      return (
        <KContext.Provider value={contextValue}>
          {createElement(FormInt, {...props, ref})}
        </KContext.Provider>
      );
    }

    return createElement(FormInt, {...props, ref});
  })
);

const FormTemplate = ({fields, buttons, onSubmit, disabled}) => (
  <form>
    {fields.default} {buttons}
  </form>
);

const FieldTemplate = ({title, input, error}) => (
  <div>
    <div>
      {title} {input}
    </div>
    <div style={{color: 'red'}}>{error}</div>
  </div>
);

const ButtonsTemplate = ({onSubmit, onReset, disabled, validating}) =>
  !disabled && (
    <div>
      <button type="submit" onClick={onSubmit} disabled={validating}>
        {validating ? 'Validating ...' : 'Save'}
      </button>
      <button type="button" onClick={onReset}>
        Cancel
      </button>
    </div>
  );

const fieldTypes = {
  text: ({id, value, onChange, onBlur, inputRef, disabled}) => (
    <input
      id={id}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      ref={inputRef}
      disabled={disabled}
    />
  ),
};

const getFormInitialModel = fields => ({
  submitRequested: false,
  fields: fields || {},
  dirty: map(always(false), fields),
  touched: map(always(false), fields),
  defaultValues: fields || {},
});

const lensForm = form =>
  lens(path([form, 'fields']), (fields, data) =>
    over(lensPath([form]), mergeLeft(getFormInitialModel(fields)), data)
  );

Form.defaultProps = {
  formTemplate: FormTemplate,
  fieldTemplate: FieldTemplate,
  buttonsTemplate: ButtonsTemplate,
  fieldTypes: fieldTypes,
  cancelText: 'Cancel',
  submitText: 'Submit',
  errorsDisplayStrategy: fieldTouchedStrategy,
  resetOnSubmit: true,
  resetOnCancel: true,
};

export {Form, lensForm};
