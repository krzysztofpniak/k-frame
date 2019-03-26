import tryRemovePrefix from './tryRemovePrefix';

const tryUnwrapAction = (prefix, action) => {
  const unwrappedType = tryRemovePrefix(prefix + '.', action.type);

  if (unwrappedType) {
    return {
      ...action,
      type: unwrappedType,
    };
  } else {
    return null;
  }
};

export default tryUnwrapAction;
