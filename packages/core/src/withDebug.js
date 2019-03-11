import shallowEqual from './shallowEqual';
import React, {Component, createElement} from 'react';

const withDebug = BaseComponent => {
  const factory = createFactory(BaseComponent);

  class WithDebug extends Component {
    componentDidUpdate(prevProps) {
      shallowEqual(prevProps, this.props, true);
    }

    render() {
      return createElement(BaseComponent, this.props);
    }
  }

  return WithDebug;
};

export default withDebug;
