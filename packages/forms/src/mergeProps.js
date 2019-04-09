import {curry} from 'ramda';

const mergeProps = curry((propName, props) => ({
  ...props,
  ...props[propName],
  [propName]: undefined,
}));

export default mergeProps;
