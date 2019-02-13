import {action} from '../';
import {
  counterState0,
  counterState1,
  someRandomAction,
  counterActionIncBy,
} from './testData';

const transform = (payload, state) => ({
  ...state,
  counter: state.counter + payload,
});

describe('action', () => {
  it('handles action', () => {
    expect(
      action(a => a.type === 'IncBy', transform)(
        counterState0,
        counterActionIncBy(1)
      )
    ).toEqual(counterState1);
  });

  it('skips action', () => {
    expect(
      action(a => a.type === 'IncBy', transform)(
        counterState1,
        someRandomAction()
      )
    ).toEqual(counterState1);
  });
});
