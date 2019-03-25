import {useContext, useCallback} from 'react';
import {KContext} from './kLogicProvider';

const useScopeProps = () => {
  const context = useContext(KContext);

  const get = useCallback(name => {
    return context.getScopeProp(context.scope, name);
  }, []);

  const set = useCallback((name, value) => {
    context.setScopeProp(context.scope, name, value);
  }, []);

  const over = useCallback((name, fn) => {
    set(name, fn(get(name)));
  }, []);
  return {get, set, over};
};

export default useScopeProps;
