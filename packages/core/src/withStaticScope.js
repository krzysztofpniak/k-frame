import React from 'react';
import Scope from './scope';

const withStaticScope = scope => BaseComponent => props => (
  <Scope scope={scope}>
    <BaseComponent {...props} />
  </Scope>
);

export default withStaticScope;
