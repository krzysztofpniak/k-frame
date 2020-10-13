import {curry, equals, has, is, mergeWithKey, mergeDeepRight} from 'ramda';
import mergeDeepRight2 from '../src/mergeDeepRight';
/*
const mergeDeepWithKey = curry(function mergeDeepWithKey(fn, lObj, rObj) {
  return mergeWithKey(
    function(k, lVal, rVal) {
      if (lVal === rVal) {
        return rVal;
      } else if (is(Object, lVal) && is(Object, rVal)) {
        const subResult = mergeDeepWithKey(fn, lVal, rVal);
        return equals(subResult, lVal) ? lVal : subResult;
      } else {
        return fn(k, lVal, rVal);
      }
    },
    lObj,
    rObj
  );
});

const mergeWithKey2 = curry(function mergeWithKey2(l, r) {
  const result = {};

  for (let k in l) {
    if (has(k, l)) {
      result[k] = has(k, r) ? mergeDeepRight2(l[k], r[k]) : l[k];
    }
  }

  for (let k in r) {
    if (has(k, r) && !has(k, result)) {
      result[k] = r[k];
    }
  }

  return result;
});

const mergeDeepRight2 = (left, right) => {
  if (left === right) {
    return right;
  } else if (is(Object, left) && is(Object, right)) {
    return mergeWithKey2(left, right);
  } else {
    return right;
  }
};
*/
describe('mergeDeepRight', () => {
  it('should ', () => {
    const counter0 = {counter: 0};
    const counter1 = {counter: 1};
    const s1 = {c1: counter0, c2: counter0};

    const s2 = mergeDeepRight2(s1, {c1: counter0, c2: counter1});

    expect(s2.c1).toBe(s1.c1);
  });

  it('should handle nested arrays', () => {
    const obj = {name: 'X'};
    const a = {a: [obj, obj]};
    const b = {a: [obj, obj, obj, obj], c: 'as'};

    const c = mergeDeepRight2(a, b);
  });
});
