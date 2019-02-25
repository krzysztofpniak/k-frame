import {identity} from 'ramda';

const createAction = (type, payloadCreator = identity) => {
  return (...args) => {
    const payload = payloadCreator(...args);

    return {type, payload};
  };
};

export default createAction;
