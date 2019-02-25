import {propEq, uncurryN} from 'ramda';
import {getActionTypeFromCreatorOrString} from './helpers';

const createPayloadReducer = (type, transform) => {
  const resolvedType = getActionTypeFromCreatorOrString(type);
  return (state, action) =>
    propEq('type', resolvedType, action)
      ? uncurryN(2, transform)(action.payload, state)
      : state;
};

export default createPayloadReducer;
