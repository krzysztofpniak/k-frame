import React, {Children, useEffect, useCallback} from 'react';
import {add, addIndex, assoc, lensProp, map, over, take, always} from 'ramda';
import {
  handleAsyncs,
  Scope,
  useAsync,
  useKReducer,
  withScope,
  useWithArgs,
  useInputTargetValue,
  createPayloadReducer,
  createStateReducer,
  createReducer,
  createAction,
} from '../../../src/main';

const mapWithKey = addIndex(map);

const getGists = itemsCount =>
  fetch('https://api.github.com/gists/public')
    .then(r => r.json(), r => r)
    .then(take(itemsCount || 5));

const studentReducer = createReducer(
  {
    name: '',
    surname: '',
  },
  [
    createPayloadReducer('SET_NAME', assoc('name')),
    createPayloadReducer('SET_SURNAME', assoc('surname')),
  ]
);

const studentActions = {
  setName: e => ({type: 'SET_NAME', payload: e.target.value}),
  setSurname: e => ({type: 'SET_SURNAME', payload: e.target.value}),
};

const Student = withScope(() => {
  const {name, setName, surname, setSurname} = useKReducer(
    studentReducer,
    studentActions
  );

  return (
    <div>
      <input value={name} onChange={setName} />
      <input value={surname} onChange={setSurname} />
    </div>
  );
});

const counterActions = {
  inc: createAction('INC'),
  dec: createAction('DEC'),
};

const counterReducer = createReducer({counter: 0}, [
  createStateReducer(counterActions.inc, over(lensProp('counter'), add(1))),
  createStateReducer(counterActions.dec, over(lensProp('counter'), add(-1))),
]);

const Counter = withScope(() => {
  const {inc, dec, counter} = useKReducer(counterReducer, counterActions);
  return (
    <div>
      <button onClick={dec}>dec</button>
      {counter}
      <button onClick={inc}>inc</button>
    </div>
  );
});

const ScopeList = ({scope, children}) => {
  return (
    <Scope scope={scope}>
      {Children.map(children, (e, idx) => ({
        ...e,
        props: {...e.props, scope: e.props.scope ? e.props.scope : '' + idx},
      }))}
    </Scope>
  );
};

const gistsActions = {
  setItemCount: createAction('setItemCount'),
};

const gistsReducer = createReducer({itemCount: '5', name: 'John'}, [
  createPayloadReducer(gistsActions.setItemCount, assoc('itemCount')),
  handleAsyncs({
    gists: {
      defaultValue: [], //?
      pendingLens: '', //?
      resultLens: '', //?
      errorLens: '', //?
      resultTransform: '', //ok
      errorTransform: '', //ok
    },
  }),
]);

const Gists = withScope(() => {
  const {data} = useKReducer(gistsReducer, gistsActions);
  const loadGists = useAsync(getGists, 'gists');
  useEffect(() => {
    loadGists(10);
  }, []);

  const load = useWithArgs(loadGists);

  return (
    <div>
      <button onClick={load}>Load</button>
      {mapWithKey(
        (g, idx) => (
          <div key={idx}>
            <a href={g.url}>{g.url}</a>
          </div>
        ),
        data.gists.result
      )}
    </div>
  );
});

const LeftMenu = withScope(() => {
  return (
    <div>
      {[1, 2, 3, 4, 5].map(e => (
        <div key={e}>Item</div>
      ))}
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

const Projects4 = () => (
  <Scope scope="root">
    <div style={{display: 'flex'}}>
      <div style={{display: 'flex', width: '250px'}}>
        <LeftMenu scope="leftMenu" />
      </div>
      <div style={{display: 'flex', flex: 1, flexDirection: 'column'}}>
        <div>Header</div>
        <div>content</div>
      </div>
    </div>
    <ScopeList scope="counters">
      <Counter />
      <Counter />
      <Counter />
    </ScopeList>
    <Gists scope="gists" />
    <Scope scope="students">
      <Student scope="s1" />
      <Student scope="s2" />
    </Scope>
    <Scope scope="fields">
      <Input scope="name" />
    </Scope>
  </Scope>
);

export default Projects4;
