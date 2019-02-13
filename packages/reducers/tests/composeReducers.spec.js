import {composeReducers} from '../';
import {
  counterState0,
  counterState1,
  counterReducer,
  textStateEmpty,
  textStateHello,
  textReducer,
  textActionSet,
  someRandomAction,
  counterActionInc,
} from './testData';

describe('composeReducers', () => {
  it('composes one reducer', () => {
    expect(
      composeReducers(counterReducer)(undefined, someRandomAction)
    ).toEqual(counterState0);
  });

  it('composes two reducers', () => {
    expect(
      composeReducers(counterReducer, textReducer)(undefined, someRandomAction)
    ).toEqual({...counterState0, ...textStateEmpty});
  });

  it('composes two reducers with @@INIT', () => {
    expect(
      composeReducers(counterReducer, textReducer)(undefined, {type: '@@INIT'})
    ).toEqual({...counterState0, ...textStateEmpty});
  });

  it('composes two reducers 2', () => {
    const composedReducer = composeReducers(counterReducer, textReducer);
    let state = {...counterState0, ...textStateEmpty};
    state = composedReducer(state, counterActionInc());
    state = composedReducer(state, textActionSet('Hello'));
    expect(state).toEqual({...counterState1, ...textStateHello});
  });
});
