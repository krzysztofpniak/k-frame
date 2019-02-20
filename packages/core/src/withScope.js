import React, {Component, createFactory} from 'react';
import Scope from './scope';

const withScope = BaseComponent => {
  const factory = createFactory(BaseComponent);

  class WithScope extends Component {
    render() {
      return <Scope scope={this.props.scope}>{factory(this.props)}</Scope>;
    }
  }

  return WithScope;
};

export default withScope;
