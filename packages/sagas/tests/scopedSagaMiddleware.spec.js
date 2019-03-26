import scopedSagaMiddleware from '../src/scopedSagaMiddleware';
import {getContext, takeEvery, select, put} from 'redux-saga/effects';
import {createStore, applyMiddleware} from 'redux';

describe('scopedSagaMiddleware', () => {
  it('should throw when not applied to the store', () => {
    expect(() => scopedSagaMiddleware.run()).toThrow();
  });

  it('should run saga', () => {
    let actual = null;

    function* saga(...args) {
      actual = args;
    }

    createStore(() => {}, applyMiddleware(scopedSagaMiddleware));
    const task = scopedSagaMiddleware.run({scope: []}, saga, 'foo', 'bar'); // middleware.run must return a Task Object

    //expect(is.task(task)).toBe(true);
    const expected = ['foo', 'bar']; // middleware must run the Saga and provides it with the given arguments

    expect(actual).toEqual(expected);
  });

  it('should have access to context', () => {
    let actual = [];

    function* saga() {
      actual.push(yield getContext('a'));
      actual.push(yield getContext('b'));
    }

    createStore(() => {}, applyMiddleware(scopedSagaMiddleware));
    scopedSagaMiddleware.run({scope: [], context: {a: 123, b: 234}}, saga);

    const expected = [123, 234]; // middleware must run the Saga and provides it with the given arguments

    expect(actual).toEqual(expected);
  });

  it('should communicate within its scope', () => {
    let actual = [];

    function* saga() {
      actual.push(yield select(m => m.counter));

      yield takeEvery('ping', function*(action) {
        actual.push(action);
        yield put({type: 'pong'});
      });
    }

    const initialState = {
      root: {
        subScope: {
          counter: 1001,
        },
      },
    };

    let isStoreCreated = false;

    const reducer = (state = initialState, action) => {
      if (isStoreCreated) {
        actual.push({...action, fromReducer: true});
      }
      return state;
    };

    const store = createStore(reducer, applyMiddleware(scopedSagaMiddleware));
    isStoreCreated = true;
    scopedSagaMiddleware.run({scope: ['root', 'subScope']}, saga);
    store.dispatch({type: 'foreign'});
    store.dispatch({type: 'root.subScope.ping', payload: 'Hi'});

    const expected = [
      1001,
      {type: 'foreign', fromReducer: true},
      {type: 'root.subScope.ping', payload: 'Hi', fromReducer: true},
      {
        type: 'ping',
        payload: 'Hi',
      },
      {type: 'root.subScope.pong', fromReducer: true},
    ];

    expect(actual).toEqual(expected);
  });
});
