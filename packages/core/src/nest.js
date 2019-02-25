import {
  compose,
  lensProp,
  prop,
  set,
  startsWith,
  view,
  useWith,
  identity,
} from 'ramda';

const startsWithPrefix = useWith(startsWith, [identity, prop('type')]);

const nest = (type, subReducer) => (state, action) => {
  const prefix = `${type}.`;
  const subState = view(lensProp(type), state);
  const initializedState = subState
    ? state
    : set(lensProp(type), subReducer(undefined, {type: '@@NEST_INIT'}), state);

  if (startsWithPrefix(prefix, action)) {
    const unwrappedAction = {
      ...action,
      type: action.type.substr(prefix.length),
    };

    const newSubState = subReducer(subState, unwrappedAction);

    return newSubState !== subState
      ? set(lensProp(type), newSubState, initializedState)
      : initializedState;
  } else {
    return initializedState;
  }
};

export default nest;
