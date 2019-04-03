import React, {
  createElement,
  useCallback,
  useMemo,
  useEffect,
  useRef,
  useContext,
  memo,
} from 'react';
import {filter, map, find, reduceBy, propOr, keys, flip, prop} from 'ramda';
import useFormReducer from './useFormReducer';
import {KContext, withScope, shallowEqual} from '@k-frame/core';
import FormContext from './FormContext';
import {getContextValue} from './formConnect';
import mergeProps from './mergeProps';
import Field from './field';
import {fieldTouchedStrategy} from './errorsDisplayStrategies';

const GenericError = ({content}) => (
  <div className="alert alert-danger" role="alert">
    {content}
  </div>
);

const FormInt = withScope(
  ({
    name,
    legend,
    formTemplate,
    formTemplateProps,
    fieldTemplate,
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
    errorsDisplayStrategy,
  }) => {
    const argsKeys = useMemo(() => keys(args), []);
    const argsValues = map(k => args[k], argsKeys);

    const {
      handleOnBlur,
      handleRefSet,
      getFields,
      formContext,
      handleOnChange,
      focusFirstField,
      defaultSubmitHandler,
    } = useFormReducer({
      fieldTypes,
      schema,
      errorsDisplayStrategy,
      args,
      resetOnSubmit,
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

    const defaultResetHandler = useCallback(() => {}, []);

    const handleReset = useCallback(e => {
      e.preventDefault();
      return onReset ? onReset(defaultResetHandler) : defaultResetHandler();
    });

    const handleSubmit = useCallback(
      e => {
        e.preventDefault();
        return onSubmit
          ? onSubmit(defaultSubmitHandler, getFields())
          : defaultSubmitHandler();
      },
      [defaultSubmitHandler, onSubmit]
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
          />
        ),
      [fieldTemplate, fieldTypes, name]
    );

    const renderedFields = useMemo(
      () => reduceBy(groupFields, [], propOr('default', 'group'), schema),
      [schema]
    );

    const renderedForm = useMemo(
      () => (
        <FormContext.Provider value={formContext}>
          {createElement(formTemplate, {
            fields: renderedFields,
            buttons,
            genericError,
            legend,
            onSubmit: handleSubmit,
          })}
        </FormContext.Provider>
      ),
      [buttons, renderedFields]
    );

    return renderedForm;
  }
);

const Form = flip(memo)((props, nextProps) =>
  shallowEqual(mergeProps('args')(props), mergeProps('args')(nextProps))
)(props => {
  if (!props.schema) {
    console.error('Schema prop is required');
    return null;
  }

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
});

const FormTemplate = ({fields, buttons, onSubmit}) => (
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
  text: ({id, value, onChange, onBlur, inputRef}) => (
    <input
      id={id}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      ref={inputRef}
    />
  ),
};

Form.defaultProps = {
  formTemplate: FormTemplate,
  fieldTemplate: FieldTemplate,
  buttonsTemplate: ButtonsTemplate,
  fieldTypes: fieldTypes,
  cancelText: 'Cancel',
  submitText: 'Submit',
  errorsDisplayStrategy: fieldTouchedStrategy,
  resetOnSubmit: true,
};

export {Form};
