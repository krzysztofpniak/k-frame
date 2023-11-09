import React, {
  createElement,
  forwardRef,
  memo,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  always,
  compose,
  flip,
  fromPairs,
  identity,
  indexBy,
  keys,
  lens,
  lensPath,
  map,
  mergeLeft,
  over,
  path,
  pathOr,
  prop,
  propOr,
  reduceBy,
} from 'ramda';
import useFormReducer from './useFormReducer';
import {KContext, shallowEqual, useScheduler, withScope} from '@k-frame/core';
import FormContext from './FormContext';
import {getPlainReduxKContextValue} from './formReducer';
import mergeProps from './mergeProps';
import Field from './field';
import FormTemplateProxy from './formTemplateProxy';
import {fieldTouchedStrategy} from './errorsDisplayStrategies';
import {distinctUntilChanged, oMap} from './micro-rx/index';
import {chain, encase} from 'fluture';

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
        scheduler,
      },
      ref
    ) => {
      const argsKeys = useMemo(() => keys(args), []);
      const argsValues = map(k => args[k], argsKeys);

      const defaultScheduler = useScheduler();
      const finalScheduler = scheduler || defaultScheduler;

      const {
        handleOnBlur,
        handleInputRefSet,
        handleRefSet,
        getFields,
        reset,
        init,
        formContext,
        handleOnChange,
        handleOnUpdate,
        focusFirstField,
        defaultSubmitFuture,
        validateFuture,
        validatePickFuture,
        validateOmitFuture,
        setField,
        setFields,
        setSubmitDirty,
      } = useFormReducer({
        fieldTypes,
        schema,
        errorsDisplayStrategy,
        args,
        resetOnSubmit,
        resetOnCancel,
        scheduler: finalScheduler,
        formRefCreator: () => ({
          submit: handleSubmit,
          getFields,
          setField,
          setFields,
          setSubmitDirty,
          reset,
          clear,
          validateFuture,
          validatePickFuture,
          validateOmitFuture,
        }),
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
          if (e) {
            e.preventDefault();
          }

          const callOnValidated = () =>
            defaultSubmitFuture
            |> chain(encase(onValidated || identity))
            |> finalScheduler.enqueueLabeled({label: '', key: 'submit'});

          return onSubmit
            ? onSubmit(defaultSubmitFuture, getFields())
            : callOnValidated();
        },
        [defaultSubmitFuture, onSubmit, onValidated, finalScheduler]
      );

      const clear = useCallback(() => init(getDefaultValues(schema)), [schema]);

      useImperativeHandle(ref, () => ({
        submit: handleSubmit,
        getFields,
        setField,
        setFields,
        reset,
        clear,
        setSubmitDirty,
        validateFuture,
        validatePickFuture,
        validateOmitFuture,
      }));

      const [validating, setValidating] = useState(false);

      useLayoutEffect(
        () =>
          distinctUntilChanged(
            oMap(
              ({formState: {validating}}) => validating,
              formContext.observable
            )
          ).subscribe(setValidating),
        []
      );

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
            validating: validating || finalScheduler.pending,
          }),
        [
          buttonsTemplate,
          handleSubmit,
          name,
          cancelText,
          submitText,
          disabled,
          validating,
          finalScheduler.pending,
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
                inputRef={handleInputRefSet}
                setRef={handleRefSet}
                title={f.title}
                fieldTemplate={fieldTemplate}
                formName={name}
                onChange={handleOnChange}
                onUpdate={handleOnUpdate}
                onBlur={handleOnBlur}
                parse={f.parse}
                format={f.format}
                type={f.type || 'text'}
                component={fieldTypes[f.type || 'text']}
                disabled={disabled}
                scheduler={finalScheduler}
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

const FieldTemplate = ({id, title, input, error}) => (
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
  validating: false,
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
