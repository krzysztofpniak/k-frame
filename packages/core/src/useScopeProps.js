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
  return {get, set};
};

export default useScopeProps;
