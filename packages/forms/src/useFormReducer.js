import {useCallback, useContext, useLayoutEffect, useMemo} from 'react';
import {setField, setTouched, setSubmitDirty, submit} from './actions';
import {bindActionCreators, KContext} from '@k-frame/core';
import {createUpdater} from './updater';
import {pathOr} from 'ramda';

const formActions = {
  setField,
  setTouched,
  setSubmitDirty,
  submit,
};

const useFormReducer = (fieldTypes, schema) => {
  const context = useContext(KContext);

  const reducer = useMemo(() => createUpdater(fieldTypes, schema), []);

  useLayoutEffect(() => {
    const reducerPath = [...context.scope, '.'];
    context.assocReducer(reducerPath, reducer);
  }, []);

  //TODO: performance
  const initialState = reducer(undefined, {type: '@@INIT'});

  const getFields = useCallback(
    () =>
      pathOr(
        initialState.fields,
        [...context.scope, 'fields'],
        context.getState()
      ),
    []
  );

  const getTouched = useCallback(
    () =>
      pathOr(
        initialState.fields,
        [...context.scope, 'touched'],
        context.getState()
      ),
    []
  );

  const getFormState = useCallback(
    () => pathOr(initialState, context.scope, context.getState()),
    []
  );

  const isFieldTouched = useCallback(fieldId => {
    const state = getFormState();
    return pathOr(false, ['touched', fieldId], state);
  }, []);

  const result = useMemo(
    () => ({
      ...bindActionCreators(formActions, context.dispatch),
      ...initialState,
      getFields,
      getTouched,
      getFormState,
      isFieldTouched,
    }),
    []
  );

  return result;
};

export default useFormReducer;
