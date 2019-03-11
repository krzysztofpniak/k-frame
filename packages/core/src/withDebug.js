import React, {Component, createElement} from 'react';
import {pick} from 'ramda';
import shallowEqual, {is} from './shallowEqual';

const hasOwnProperty = Object.prototype.hasOwnProperty;

const getChangedPropNames = (objA, objB) => {
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  const keys = keysA.length > keysB.length ? keysA : keysB;

  const result = [];

  for (let i = 0; i < keys.length; i++) {
    if (!is(objA[keys[i]], objB[keys[i]])) {
      result.push(keys[i]);
    }
  }

  return result;
};

const withDebug = identifier => BaseComponent => {
  class WithDebug extends Component {
    componentDidUpdate(prevProps) {
      if (!shallowEqual(prevProps, this.props)) {
        const changedProps = getChangedPropNames(prevProps, this.props);
        console.log(
          `changed ${identifier}: ${changedProps.join(', ')}`,
          pick(changedProps, prevProps),
          pick(changedProps, this.props)
        );
      }
    }

    render() {
      return createElement(BaseComponent, this.props);
    }
  }

  return WithDebug;
};

export default withDebug;
