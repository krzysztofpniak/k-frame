const counterState0 = {
  counter: 0,
};

const counterState1 = {
  counter: 1,
};

const counterActionIncBy = by => ({type: 'IncBy', payload: by});

const counterActionInc = () => ({type: 'Inc'});

const counterReducer = (state = counterState0, action) => {
  switch (action.type) {
    case 'IncBy':
      return {
        ...state,
        counter: state.counter + action.payload,
      };
    case 'Inc':
      return {
        ...state,
        counter: state.counter + 1,
      };
    default:
      return state;
  }
};

const textStateEmpty = {
  text: '',
};

const textStateHello = {
  text: 'Hello',
};

const textActionSet = text => ({type: 'SetText', payload: text});

const textReducer = (state = textStateEmpty, action) => {
  switch (action.type) {
    case 'SetText':
      return {
        ...state,
        text: action.payload,
      };
    default:
      return state;
  }
};

const someRandomAction = () => ({type: 'SomeRAnd0mAction'});

export {
  counterState0,
  counterState1,
  counterActionIncBy,
  counterActionInc,
  counterReducer,
  textStateEmpty,
  textStateHello,
  textActionSet,
  textReducer,
  someRandomAction,
};
