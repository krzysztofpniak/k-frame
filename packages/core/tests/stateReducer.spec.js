import {createStateReducer} from '../src/main';
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

describe('createStateReducer', () => {
  it('handles action', () => {
    expect(
      createStateReducer('Inc', transform)(counterState0, counterActionInc())
    ).toEqual(counterState1);
  });

  it('handles action creator', () => {
    expect(
      createStateReducer(counterActionInc, transform)(
        counterState0,
        counterActionInc()
      )
    ).toEqual(counterState1);
  });

  it('skips action', () => {
    expect(
      createStateReducer('IncBy', transform)(counterState0, someRandomAction())
    ).toEqual(counterState0);
  });
});
