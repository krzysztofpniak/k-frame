import {createReducer} from '../src/main';

const state1 = {
  counter: 0,
};

const state2 = {
  counter: 1,
};

const state3 = {
  counter: 1,
  title: 'abc',
};

const action1 = {
  type: 'INC_BY',
  payload: 1,
};

const action2 = {
  type: 'UNKNOWN',
  payload: 1,
};

const reducer1 = (state, action) => {
  if (action.type === 'INC_BY') {
    return {
      ...state,
      counter: state.counter + action.payload,
    };
  } else {
    return state;
  }
};

const reducer2 = (state = {title: 'abc'}, action) => {
  if (action.type === 'SET_TITLE') {
    return {
      ...state,
      title: action.payload,
    };
  } else {
    return state;
  }
};

describe('createReducer', () => {
  describe('empty', () => {
    it('accepts empty reducer', () => {
      expect(createReducer(state1, [])(state1, action1)).toEqual(state1);
    });

    it('accepts empty state', () => {
      expect(createReducer(state1, [])(undefined, action1)).toEqual(state1);
    });

    it('accepts empty state 2', () => {
      expect(createReducer(state1, [])()).toEqual(state1);
    });
  });

  describe('one simple reducer', () => {
    it('skips action', () => {
      expect(createReducer(state1, [reducer1])(state1, action2)).toEqual(
        state1
      );
    });

    it('handles action', () => {
      expect(createReducer(state1, [reducer1])(state1, action1)).toEqual(
        state2
      );
    });
  });

  describe('nested reducer', () => {
    it('initializes state', () => {
      expect(
        createReducer(state1, [reducer1, reducer2])(undefined, action1)
      ).toEqual(state3);
    });
  });
});
