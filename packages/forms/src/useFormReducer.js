import {useCallback, useContext, useLayoutEffect, useMemo} from 'react';
import {setField, setSubmitDirty, submit} from './actions';
import {bindActionCreators, KContext} from '@k-frame/core';
import {createUpdater} from './updater';
import {pathOr} from 'ramda';

const formActions = {
  setField,
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

  const getFormState = useCallback(
    () => pathOr(initialState, context.scope, context.getState()),
    []
  );

  const result = useMemo(
    () => ({
      ...bindActionCreators(formActions, context.dispatch),
      ...initialState,
      getFields,
      getFormState,
    }),
    []
  );

  return result;
};

export default useFormReducer;
