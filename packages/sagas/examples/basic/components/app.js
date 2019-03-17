import React, {useEffect} from 'react';
import {add, addIndex, assoc, lensProp, map, over, take, always} from 'ramda';
import {put, select, takeEvery, delay, getContext} from 'redux-saga/effects';
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

const mapWithKey = addIndex(map);

const getGists = () =>
  fetch('https://api.github.com/gists/public')
    .then(r => r.json(), r => r)
    .then(take(5));

const gistsReducer = createReducer({name: 'John'}, [
  handleAsyncs({
    gists: {},
  }),
]);

const gistsSaga = function*() {
  const name = yield select(m => m.name);
  console.log('name', name);

  const hello = yield getContext('hello');
  hello();

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
  ping: () => ({type: 'ping'}),
};

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
  const {data, ping} = useKReducer(gistsReducer, gistsActions);
  //useSaga(gistsSaga);
  const runSaga = useSagaRunner({hello});

  useEffect(() => {
    runSaga(gistsSaga);
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

const Projects4 = withScope(() => {
  const {view, setView} = useKReducer(appReducer, appActions);
  const showGists = useWithArgs(setView, 'gists');
  const showOther = useWithArgs(setView, 'other');

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
      </div>
    </div>
  );
});

export default () => <Projects4 scope="root" />;
