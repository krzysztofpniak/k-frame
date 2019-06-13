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
import {shallowEqual} from '@k-frame/core';
import {oMap, distinctUntilChanged} from './micro-rx/index';
import FormContext from './FormContext';

const emptyObject = {};

const FormTemplateProxy = memo(
  ({
    formTemplate,
    formTemplateProps,
    fields,
    indexedFields,
    buttons,
    genericError,
    legend,
    onSubmit,
    onReset,
  }) => {
    const formContext = useContext(FormContext);
    const initialFormTemplateProps = useMemo(() =>
      formTemplateProps
        ? formTemplateProps(formContext.initialFieldContext)
        : emptyObject
    );

    const prevProps = useRef({});
    const [props, setProps] = useState(initialFormTemplateProps);

    useLayoutEffect(() => {
      if (formTemplateProps) {
        distinctUntilChanged(
          oMap(({args, formState: {fields}}) => {
            const newProps = formTemplateProps({fields, args});
            if (prevProps.current !== newProps) {
              prevProps.current = newProps;
            }
            return prevProps.current;
          }, formContext.observable)
        ).subscribe(setProps);
      }
    }, []);

    const formLayout = useMemo(() => {
      return createElement(formTemplate, {
        fields,
        indexedFields,
        buttons,
        genericError,
        legend,
        onSubmit,
        onReset,
        ...props,
      });
    }, [props]);

    return formLayout;
  }
);

export default FormTemplateProxy;
