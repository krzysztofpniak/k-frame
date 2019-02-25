import {fromTree} from '../';

const subSpaceState1 = {
  counter: 0,
};

const subSpaceState2 = {
  counter: 1,
};

const state1 = {
  a: {
    counter: 0,
  },
  b: {
    title: 'abc',
  },
};

const state2 = {
  root: {
    a: {
      counter: 0,
    },
    b: {
      title: 'abc',
    },
  },
};

const state3 = {
  root: {
    a: {
      counter: 1,
    },
    b: {
      title: 'abc',
    },
  },
};

const state4 = {
  title: 'Hello',
  subSpace: subSpaceState2,
};

const state5 = {
  otherProp: {
    x: 1,
  },
  root: {
    a: {
      counter: 0,
    },
    b: {
      title: 'abc',
    },
    otherProp2: {
      y: 1,
    },
  },
};

const state5b = {
  otherProp: {
    x: 1,
  },
  root: {
    a: {
      counter: 1,
    },
    b: {
      title: 'abc',
    },
    otherProp2: {
      y: 1,
    },
  },
};

const action1 = {
  type: 'root.a.INC_BY',
  payload: 1,
};

const action2 = {
  type: 'UNKNOWN',
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

const tree1 = {
  a: reducer1,
  b: reducer2,
};

const tree2 = {
  root: {
    a: reducer1,
    b: reducer2,
  },
};

const tree3 = {
  root: {
    sub: {
      a: reducer1,
      b: reducer2,
    },
  },
};

const state6 = {
  otherProp: {
    x: 1,
  },
  root: {
    sub: {
      a: {
        counter: 0,
      },
      b: {
        title: 'abc',
      },
      otherProp2: {
        y: 1,
      },
    },
  },
};

const state6b = {
  otherProp: {
    x: 1,
  },
  root: {
    sub: {
      a: {
        counter: 2,
      },
      b: {
        title: 'abc',
      },
      otherProp2: {
        y: 1,
      },
    },
  },
};

describe('fromTree', () => {
  it('initializes state from undefined', () => {
    expect(fromTree(tree1)(undefined, action2)).toEqual(state1);
  });
  it('initializes nested state from undefined', () => {
    expect(fromTree(tree2)(undefined, action2)).toEqual(state2);
  });
  it('handles action in nested state', () => {
    expect(fromTree(tree2)(state2, action1)).toEqual(state3);
  });
  it("doesn't brake existing state", () => {
    expect(fromTree(tree2)(state5, {type: 'dupa'})).toEqual(state5);
  });
  it('deeply nested', () => {
    expect(
      fromTree(tree3)(state6, {type: 'root.sub.a.INC_BY', payload: 2})
    ).toEqual(state6b);
  });
});
