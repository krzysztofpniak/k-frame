import React, {useCallback, useRef, useState} from 'react';
import withScope from '../src/withScope';
import kFrameDecorator from './helpers/kFrameDecorator';
import {createReducer, useKReducer} from '../src/main';
import createAction from '../src/createAction';
import createStateReducer from '../src/createStateReducer';
import {evolve, add} from 'ramda';
import Scope from '../src/scope';

const actions = {
  dec: createAction('dec', () => undefined),
  inc: createAction('inc', () => undefined),
};

const reducer = createReducer({counter: 0}, [
  createStateReducer(actions.dec, evolve({counter: add(-1)})),
  createStateReducer(actions.inc, evolve({counter: add(1)})),
]);

const Counter = withScope(({children}) => {
  const {counter, dec, inc} = useKReducer(reducer, actions);
  return (
    <div style={{padding: 40}}>
      <button onClick={dec}>dec</button>
      <span>{counter}</span>
      <button onClick={inc}>inc</button>
      {children}
    </div>
  );
});

export default {
  title: 'Simple',
  component: Counter,
  decorators: [kFrameDecorator],
};

export const Simple = () => (
  <div>
    <Scope scope="root">
      <div>
        <Counter scope="a" autoFocus />
        <Counter scope="b" autoFocus>
          <Counter scope="c" autoFocus />
        </Counter>
      </div>
    </Scope>
  </div>
);
