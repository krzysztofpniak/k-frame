import React, {useEffect} from 'react';
import {add, addIndex, assoc, lensProp, map, over, take, always} from 'ramda';
import {
  put,
  select,
  takeEvery,
  delay,
  getContext,
  setContext,
  fork,
} from 'redux-saga/effects';
import {
  createReducer,
  handleAsyncs,
  Scope,
  useKReducer,
  withScope,
  createPayloadReducer,
  createAction,
  useWithArgs,
} from '@k-frame/core';
import {useSaga, useSagaRunner} from '../../../src/main';
import Counter from './counter';
import Countdown from './countDown';

const mapWithKey = addIndex(map);

const getGists = () =>
  fetch('https://api.github.com/gists/public')
    .then(r => r.json(), r => r)
    .then(take(5));

const gistsSaga = function*() {
  const name = yield select(m => m.name);
  console.log('name', name);

  //const hello = yield getContext('hello');
  //hello();

  //yield asyncCall();

  yield takeEvery('ping', function*() {
    for (let i = 0; i < 5; i++) {
      console.log('ping received');
      yield delay(1000);
      yield put({type: 'pong', payload: i});
    }
  });
};

const gistsActions = {
  ping: createAction('ping'),
  pong: createAction('pong'),
};

const gistsReducer = createReducer(
  {name: 'John', counter: 0, countdown: null},
  [
    handleAsyncs({
      gists: {},
    }),
  ]
);

const hello = () => console.log('hi from view');

const LeftMenu = withScope(() => {
  return (
    <div>
      {[1, 2, 3, 4, 5].map(e => (
        <div key={e}>Item</div>
      ))}
    </div>
  );
});

const Gists = withScope(() => {
  const {data, ping, counter, countdown} = useKReducer(
    gistsReducer,
    gistsActions
  );
  //useSaga(gistsSaga);
  const {fork, tasks} = useSagaRunner({hello});

  useEffect(() => {
    //fork('dupa', gistsSaga, 1, 2, 3);
    fork(gistsSaga);
  }, []);

  return (
    <div>
      <button onClick={ping}>Ping</button>
      {mapWithKey(
        (g, idx) => (
          <div key={idx}>
            <a href={g.url}>{g.url}</a>
          </div>
        ),
        data.gists.result || []
      )}
    </div>
  );
});

const inputActions = {
  setField: e => ({type: 'SetField', payload: e.target.value}),
};

const inputReducer = createReducer('Jan', [(state, action) => state]);

const Input = withScope(() => {
  const {value, setField} = useKReducer(inputReducer, inputActions);
  return <input value={value} onChange={setField} />;
});

const appActions = {
  setView: createAction('setView'),
};

const appReducer = createReducer({view: 'gists'}, [
  createPayloadReducer(appActions.setView, assoc('view')),
]);

function* appSaga() {
  let counter = 0;
  while (true) {
    yield delay(300);
    yield setContext({xx: counter++});
    console.log('appSaga', yield getContext('xx'));
  }
}

const Projects4 = withScope(() => {
  const {view, setView} = useKReducer(appReducer, appActions);
  const showGists = useWithArgs(setView, 'gists');
  const showOther = useWithArgs(setView, 'other');

  const {fork} = useSagaRunner({hello});

  useEffect(() => {
    fork(appSaga);
  }, []);

  return (
    <div style={{display: 'flex'}}>
      <div style={{display: 'flex', width: '250px'}}>
        <LeftMenu scope="leftMenu" />
        <button type="button" onClick={showGists}>
          Show Gists
        </button>
        <button type="button" onClick={showOther}>
          Show Other
        </button>
      </div>
      <div style={{display: 'flex', flex: 1, flexDirection: 'column'}}>
        <div>{view}</div>
        <div>{view === 'gists' ? <Gists scope="gists" /> : 'Other view'}</div>
        <Countdown scope="cd1" />
      </div>
    </div>
  );
});

export default () => <Projects4 scope="root" />;
