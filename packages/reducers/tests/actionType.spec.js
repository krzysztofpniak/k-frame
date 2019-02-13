import {actionType} from '../';
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

describe('actionType', () => {
  it('handles action', () => {
    expect(
      actionType('IncBy', transform)(counterState0, counterActionIncBy(1))
    ).toEqual(counterState1);
  });

  it('handles action creator', () => {
    expect(
      actionType(counterActionIncBy, transform)(
        counterState0,
        counterActionIncBy(1)
      )
    ).toEqual(counterState1);
  });

  it('skips action', () => {
    expect(
      actionType('IncBy', transform)(counterState0, someRandomAction())
    ).toEqual(counterState0);
  });
});
