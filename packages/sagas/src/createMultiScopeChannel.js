import {find, propEq} from 'ramda';
import {stdChannel} from 'redux-saga';
import tryUnwrapAction from './tryUnwrapAction';

const createMultiScopeChannel = () => {
  const subscribers = [];

  const getScopeChannel = scope => {
    const prefix = scope.join('.');

    let entry = find(propEq('prefix', prefix), subscribers);
    if (!entry) {
      entry = {
        prefix,
        channel: stdChannel(),
      };
      subscribers.push(entry);
    }

    return entry.channel;
  };

  const emit = action => {
    const arr = [...subscribers];
    for (let i = 0, len = arr.length; i < len; i++) {
      const entry = arr[i];
      const unwrappedAction = tryUnwrapAction(entry.prefix, action);
      if (unwrappedAction) {
        arr[i].channel.put(unwrappedAction);
      }
    }
  };

  return {
    getScopeChannel,
    emit,
  };
};

export default createMultiScopeChannel;
