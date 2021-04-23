import React, {forwardRef} from 'react';
import {ForwardRef} from 'react-is';
import Scope from './scope';

const withScope = BaseComponent =>
  forwardRef((props, ref) => (
    <Scope scope={props.scope}>
      <BaseComponent ref={BaseComponent.$$typeof === ForwardRef ? ref : undefined} {...props} />
    </Scope>
  ));

export default withScope;
