import {
  createElement,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {equals} from 'ramda';
import {distinctUntilChanged, oMap} from './micro-rx/index';
import FormContext from './FormContext';
import {useEqualsEffect} from '@k-frame/core';
import {ForwardRef, Memo, Lazy} from 'react-is';

const useLazyState = initialValue => {
  const [value, setValue] = useState(initialValue);
  const valueRef = useRef(initialValue);
  const trySet = useCallback(newValue => {
    if (!equals(valueRef.current, newValue)) {
      setValue(newValue);
      valueRef.current = newValue;
    }
  }, []);
  return [value, trySet];
};

const setReactRef = (ref, value) => {
  if (typeof ref === 'function') {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
};

const tryPassRef = component => ref =>
  component.$$typeof === Lazy ||
  component.$$typeof === ForwardRef ||
  (component.$$typeof === Memo && component.type.$$typeof === ForwardRef)
    ? ref
    : undefined;

const Field = memo(
  ({
    id,
    type,
    fieldTemplate,
    formName,
    title,
    onChange,
    onUpdate,
    onBlur,
    component,
    parse,
    inputRef,
    setRef,
    disabled,
    scheduler,
  }) => {
    const formContext = useContext(FormContext);
    const initialState = useMemo(() => formContext.getFieldState(id), []);

    const [value, setValue] = useLazyState(initialState.value);
    const [formattedValue, setFormattedValue] = useLazyState(
      initialState.formattedValue
    );
    const [error, setError] = useLazyState(
      initialState.errorVisible ? initialState.error : ''
    );
    const [errorVisible, setErrorVisible] = useLazyState(
      initialState.errorVisible
    );
    const [props, setProps] = useLazyState(initialState.props);
    const [isVisible, setVisibility] = useLazyState(initialState.visible);

    const [argsState, setArgsState] = useLazyState({});

    useEqualsEffect(() => {
      onUpdate(value, id);
    }, [onUpdate, value, id, argsState]);

    useEffect(() => {
      const updateField = ([state, args]) => {
        setValue(state.value);
        setFormattedValue(state.formattedValue);
        setProps(state.props);
        setError(state.errorVisible ? state.error : '');
        setErrorVisible(state.errorVisible);
        setVisibility(state.visible);
        setArgsState(args);
      };

      const unsubscribe = distinctUntilChanged(
        oMap(({fieldsStates, args}) => {
          return [fieldsStates[id], args];
        }, formContext.observable)
      ).subscribe(updateField);

      const unmount = formContext.mountField(id);

      return () => {
        unsubscribe();
        unmount();
      };
    }, []);

    const handleOnChange = useCallback(
      e => {
        const value = !e.target ? e : e.target.value;
        const parsedValue = parse ? parse(value) : value;

        onChange(parsedValue, id);
      },
      [id, onChange]
    );

    const handleOnBlur = useCallback(() => {
      onBlur(id);
    }, [id, onBlur]);

    const handleInputRefSet = useCallback(
      ref => {
        inputRef(ref, id);
      },
      [id, inputRef]
    );

    const handleRefSet = useCallback(
      ref => {
        if (props.ref) {
          setReactRef(props.ref, ref);
        }
        setRef(ref, id);
      },
      [id, setRef, props.ref]
    );

    const field = useMemo(() => {
      return isVisible
        ? createElement(fieldTemplate, {
            title,
            id,
            input: createElement(component, {
              id: (formName || '') + (formName ? '-' : '') + id,
              title,
              inputRef: handleInputRefSet,
              value,
              formattedValue,
              onChange: handleOnChange,
              onBlur: handleOnBlur,
              disabled,
              type,
              error,
              showErrors: errorVisible,
              scope: `sub.${id}`,
              scheduler,
              ...props,
              ref: tryPassRef(component)(handleRefSet),
            }),
            ...props,
            ref: tryPassRef(fieldTemplate)(props.ref),
            error,
          })
        : null;
    }, [value, error, isVisible, props, disabled, formattedValue]);

    return field;
  }
);

Field.displayName = 'Field';

export default Field;
