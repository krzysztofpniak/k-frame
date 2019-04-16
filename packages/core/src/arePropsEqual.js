import {curry} from 'ramda';

const arePropsEqual = curry((props, a, b) => {
  for (let i = 0; i < props.length; i++) {
    const prop = props[i];
    if (a[prop] !== b[prop]) {
      return false;
    }
  }
  return true;
});

export default arePropsEqual;
