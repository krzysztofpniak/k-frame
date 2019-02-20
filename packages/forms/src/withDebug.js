import React, {Component, createFactory} from 'react';
import {shallowEqual} from './helpers';

const withDebug = BaseComponent => {
  const factory = createFactory(BaseComponent);

  class WithDebug extends Component {
    componentDidUpdate(prevProps) {
      shallowEqual(prevProps, this.props, true);
    }

    render() {
      return factory(this.props);
    }
  }

  return WithDebug;
};

export default withDebug;
