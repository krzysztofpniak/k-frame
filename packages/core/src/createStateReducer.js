import {propEq, uncurryN} from 'ramda';
import {getActionTypeFromCreatorOrString} from './helpers';

const createStateReducer = (type, transform) => {
  const resolvedType = getActionTypeFromCreatorOrString(type);
  return (state, action) =>
    propEq('type', resolvedType, action)
      ? uncurryN(1, transform)(state)
      : state;
};

export default createStateReducer;
