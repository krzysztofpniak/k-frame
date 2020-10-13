import {curry, equals, has, is, mergeWithKey} from 'ramda';

const isObject = x => {
  return Object.prototype.toString.call(x) === '[object Object]';
};

const isObject0 = is(Object);

const mergeWithKey2 = curry(function mergeWithKey2(l, r) {
  const result = {};

  for (let k in l) {
    if (has(k, l)) {
      result[k] = has(k, r) ? mergeDeepRight(l[k], r[k]) : l[k];
    }
  }

  for (let k in r) {
    if (has(k, r) && !has(k, result)) {
      result[k] = r[k];
    }
  }

  return result;
});

function compareKeys(a, b) {
  const aKeys = Object.keys(a).sort();
  const bKeys = Object.keys(b).sort();
  return JSON.stringify(aKeys) === JSON.stringify(bKeys);
}

const mergeDeepRight = (left, right) => {
  if (left === right || !left || !right || compareKeys(left, right)) {
    return right;
  } else if (isObject(left) && isObject(right)) {
    return mergeWithKey2(left, right);
  } else {
    return right;
  }
};

export default mergeDeepRight;
