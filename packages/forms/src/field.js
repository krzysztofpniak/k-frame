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
  }) => {
    const formContext = useContext(FormContext);
    const initialState = useMemo(() => formContext.getFieldState(id), []);

    const [value, setValue] = useLazyState(initialState.value);
    const [error, setError] = useLazyState(
      initialState.errorVisible && initialState.error
    );
    const [props, setProps] = useLazyState(initialState.props);
    const [isVisible, setVisibility] = useLazyState(initialState.visible);

    useEffect(() => {
      const updateField = state => {
        setValue(state.value);
        setProps(state.props);
        setError(state.errorVisible && state.error);
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

    const formattedValue = useMemo(() => (format ? format(value) : value), [
      value,
    ]);

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

    const field = useMemo(() => {
      return isVisible
        ? createElement(fieldTemplate, {
            title,
            input: createElement(component, {
              id: (formName || '') + (formName ? '-' : '') + id,
              title,
              inputRef: handleRefSet,
              value: formattedValue,
              onChange: handleOnChange,
              onBlur: handleOnBlur,
              type,
              error,
              scope: `sub.${id}`,
              ...props,
            }),
            ...props,
            error,
          })
        : null;
    }, [value, error, isVisible, props]);

    return field;
  }
);

export default Field;
