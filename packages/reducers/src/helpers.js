import {call, compose, is, prop, when} from 'ramda';

const getActionTypeFromCreatorOrString = when(
  is(Function),
  compose(
    prop('type'),
    call
  )
);

export {getActionTypeFromCreatorOrString};
