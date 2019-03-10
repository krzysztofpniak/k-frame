import {nest} from '../src/main';

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
  type: 'subSpace.INC_BY',
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

const reducer1 = (state = subSpaceState1, action) => {
  if (action.type === 'INC_BY') {
    return {
      counter: state.counter + action.payload,
    };
  } else {
    return state;
  }
};

describe('nest', () => {
  it('initializes nested state from undefined', () => {
    expect(nest('subSpace', reducer1)(undefined, action2)).toEqual(state2);
  });

  it('initializes nested state from object', () => {
    expect(nest('subSpace', reducer1)(state1, action2)).toEqual(state3);
  });

  it('handles action', () => {
    expect(nest('subSpace', reducer1)(state1, action1)).toEqual(state4);
  });

  it('passes action with untouched state', () => {
    expect(nest('subSpace', reducer1)(state4, action3)).toBe(state4);
  });
});
