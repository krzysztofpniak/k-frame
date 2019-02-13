import {propEq, uncurryN} from 'ramda';
import {getActionTypeFromCreatorOrString} from './helpers';

const actionType = (type, transform) => {
  const resolvedType = getActionTypeFromCreatorOrString(type);
  return (state, action) =>
    propEq('type', resolvedType, action)
      ? uncurryN(2, transform)(action.payload, state)
      : state;
};

export default actionType;
