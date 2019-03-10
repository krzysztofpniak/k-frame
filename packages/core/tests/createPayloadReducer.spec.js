import {createPayloadReducer} from '../src/main';
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

describe('createPayloadReducer', () => {
  it('handles action', () => {
    expect(
      createPayloadReducer('IncBy', transform)(
        counterState0,
        counterActionIncBy(1)
      )
    ).toEqual(counterState1);
  });

  it('handles action creator', () => {
    expect(
      createPayloadReducer(counterActionIncBy, transform)(
        counterState0,
        counterActionIncBy(1)
      )
    ).toEqual(counterState1);
  });

  it('skips action', () => {
    expect(
      createPayloadReducer('IncBy', transform)(
        counterState0,
        someRandomAction()
      )
    ).toEqual(counterState0);
  });
});
