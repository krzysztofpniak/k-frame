import {equals} from 'ramda';
import {printReceived, printExpected} from 'jest-matcher-utils';

expect.extend({
  toFLEqual(received, target) {
    const pass = equals(received, target);
    if (pass) {
      return {
        message: () =>
          `expected ${printReceived(received)} not to be equal ${printExpected(
            target
          )}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${printReceived(received)} to be equal ${printExpected(
            target
          )}`,
        pass: false,
      };
    }
  },
});
