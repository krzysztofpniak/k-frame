import {nest} from '../src/main';
import {
  counterState0,
  counterState1,
  counterReducer,
  counterActionIncBy,
  textStateHello,
} from './testData';
import createReducer from '../src/createReducer';

const subSpaceState1 = {
  counter: 0,
};

const subSpaceState2 = {
  counter: 1,
};

const state1 = {
  title: 'Hello',
};

const state2 = {
  subSpace: subSpaceState1,
};

const state3 = {
  title: 'Hello',
  subSpace: subSpaceState1,
};

const state4 = {
  title: 'Hello',
  subSpace: subSpaceState2,
};

const action1 = {
  type: 'subSpace.IncBy',
  payload: 1,
};

const action2 = {
  type: 'UNKNOWN',
  payload: 1,
};

const action3 = {
  type: 'subSpace.UNKNOWN',
  payload: 1,
};

describe('nest', () => {
  it('initializes nested state from undefined', () => {
    expect(nest('subSpace', counterReducer)(undefined, action2)).toEqual({
      subSpace: counterState0,
    });
  });

  it('initializes nested state from object', () => {
    expect(nest('subSpace', counterReducer)(state1, action2)).toEqual(state3);
  });

  it('handles action', () => {
    const reducer = nest('subSpace', counterReducer);
    const newState = reducer(
      {otherScope: textStateHello, subSpace: counterState0},
      action1
    );
    expect(newState).toEqual({
      otherScope: textStateHello,
      subSpace: counterState1,
    });
    expect(newState.otherScope).toBe(textStateHello);
  });

  it('passes action with untouched state', () => {
    expect(nest('subSpace', counterReducer)(state4, action3)).toBe(state4);
  });

  it('should keep references', () => {
    const state1 = {c1: counterState0, c2: counterState1};

    const state2 = nest('c1', (s = counterState0, {type}) =>
      type === 'inc' ? {...s, counter: s.counter + 1} : s
    )(state1, {
      type: 'c1.inc',
    });

    expect(state2.c1).toEqual(counterState1);
    expect(state2.c2).toBe(state1.c2);
  });
});
