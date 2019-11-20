import React, {forwardRef} from 'react';
import Scope from './scope';

const withScope = BaseComponent =>
  forwardRef((props, ref) => (
    <Scope scope={props.scope}>
      <BaseComponent ref={ref} {...props} />
    </Scope>
  ));

export default withScope;
