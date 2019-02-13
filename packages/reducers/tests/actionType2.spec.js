import {actionType2} from '../';
import {
  counterState0,
  counterState1,
  someRandomAction,
  counterActionInc,
} from './testData';

const transform = state => ({
  ...state,
  counter: state.counter + 1,
});

describe('actionType2', () => {
  it('handles action', () => {
    expect(
      actionType2('Inc', transform)(counterState0, counterActionInc())
    ).toEqual(counterState1);
  });

  it('handles action creator', () => {
    expect(
      actionType2(counterActionInc, transform)(
        counterState0,
        counterActionInc()
      )
    ).toEqual(counterState1);
  });

  it('skips action', () => {
    expect(
      actionType2('IncBy', transform)(counterState0, someRandomAction())
    ).toEqual(counterState0);
  });
});
