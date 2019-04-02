import {
  createElement,
  memo,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {KContext, shallowEqual} from '@k-frame/core';
import {keys, map, path, pathOr} from 'ramda';
import mergeProps from './mergeProps';

const Field = memo(
  ({
    id,
    type,
    fieldTemplate,
    formName,
    title,
    onChange,
    component,
    defaultValue,
    format,
    parse,
    inputRef,
    error,
    visible,
    props,
  }) => {
    const context = useContext(KContext);

    const rawState = context.getState();

    const fieldsValues = useRef(
      pathOr({}, [...context.scope, 'fields'], rawState)
    );

    const [state, setState] = useState(
      pathOr(defaultValue || '', [...context.scope, 'fields', id], rawState)
    );

    const [isVisible, setVisibility] = useState(true);

    const stateRef = useRef(state);

    useLayoutEffect(() => {
      return context.subscribe(() => {
        const fields = path([...context.scope, 'fields'], context.getState());
        if (fieldsValues.current !== fields) {
          fieldsValues.current = fields;
          const newState = path([id], fields);
          if (newState !== stateRef.current) {
            setState(newState);
            stateRef.current = newState;
          }

          const newVisibility =
            !visible || visible({fields: fieldsValues.current});
          if (newVisibility !== isVisible) {
            setVisibility(newVisibility);
          }
        }
      });
    }, []);

    const propsKeys = useMemo(() => keys(props), []);
    const propsValues = map(k => props[k], propsKeys);

    const formattedValue = useMemo(() => (format ? format(state) : state), [
      state,
    ]);

    const handleOnChange = useCallback(
      e => {
        const value = !e.target ? e : e.target.value;
        const parsedValue = parse ? parse(value) : value;

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

    const field = useMemo(() => {
      return isVisible
        ? createElement(fieldTemplate, {
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
          })
        : null;
    }, [state, error, isVisible, ...propsValues]);

    return field;
  },
  (props, nextProps) =>
    shallowEqual(mergeProps('props')(props), mergeProps('props')(nextProps))
);

export default Field;
