import {
  createElement,
  memo,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {oMap, distinctUntilChanged} from './micro-rx/index';
import FormContext from './FormContext';
import {identity} from 'ramda';

const useLazyState = initialValue => {
  const [value, setValue] = useState(initialValue);
  const valueRef = useRef(initialValue);
  const trySet = useCallback(newValue => {
    if (valueRef.current !== newValue) {
      setValue(newValue);
      valueRef.current = newValue;
    }
  }, []);
  return [value, trySet];
};

const Field = memo(
  ({
    id,
    type,
    fieldTemplate,
    formName,
    title,
    onChange,
    onBlur,
    component,
    format,
    parse,
    inputRef,
    fieldRef,
    disabled,
  }) => {
    const formContext = useContext(FormContext);
    const initialState = useMemo(() => formContext.getFieldState(id), []);

    const [value, setValue] = useLazyState(initialState.value);
    const [rawValue, setRawValue] = useLazyState(initialState.rawValue);
    const [error, setError] = useLazyState(
      initialState.errorVisible && initialState.error
    );
    const [errorVisible, setErrorVisible] = useLazyState(
      initialState.errorVisible
    );
    const [props, setProps] = useLazyState(initialState.props);
    const [isVisible, setVisibility] = useLazyState(initialState.visible);

    useEffect(() => {
      const updateField = state => {
        setValue(state.value);
        setRawValue(state.rawValue);
        setProps(state.props);
        setError(state.errorVisible && state.error);
        setErrorVisible(state.errorVisible);
        setVisibility(state.visible);
      };

      const unsubscribe = distinctUntilChanged(
        oMap(({fieldsStates}) => {
          return fieldsStates[id];
        }, formContext.observable)
      ).subscribe(updateField);

      const unmount = formContext.mountField(id);

      return () => {
        unsubscribe();
        unmount();
      };
    }, []);

    const [formattedValue, setFormattedValue] = useState(
      format ? null : initialState.value
    );

    useEffect(() => {
      if (format) {
        Promise.resolve(value).then(setFormattedValue);
      } else {
        setFormattedValue(value);
      }
    }, [value]);

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

    const handleRefSet = useCallback(
      ref => {
        inputRef(ref, id);
      },
      [id, inputRef]
    );

    const [errorText, setErrorText] = useState('');

    useEffect(() => {
      Promise.resolve(error).then(setErrorText);
    }, [error]);

    const field = useMemo(() => {
      return isVisible
        ? createElement(fieldTemplate, {
            title,
            input: createElement(component, {
              id: (formName || '') + (formName ? '-' : '') + id,
              title,
              inputRef: handleRefSet,
              value: format ? formattedValue : rawValue,
              rawValue: rawValue,
              onChange: handleOnChange,
              onBlur: handleOnBlur,
              disabled,
              type,
              error: errorText,
              showErrors: errorVisible,
              scope: `sub.${id}`,
              ref: fieldRef,
              ...props,
            }),
            ...props,
            error: errorText,
          })
        : null;
    }, [value, formattedValue, errorText, isVisible, props, disabled]);

    return field;
  }
);

export default Field;
