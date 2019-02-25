---
id: api-createStateReducer
title: createStateReducer
---

### `createStateReducer(type, transform)`

Creates a `reducer` that transforms `state` only when action types matches `type`.

- `type: String`

- `transform: payload -> state -> state` - transform specification

#### Example

In the following example, we use two `createStateReducer`'s to define a reducer.
First one is taking care about action of type `INC` and increments `counter` by one.
Second one watches for `SHOW_DIALOG` action and sets `dialogVisible` to true.

<!--DOCUSAURUS_CODE_TABS-->
<!--Plain JS-->

```js
import {createReducer, actionType, createAction} from '@k-frame/core';

const actions = {
  inc: createAction('INC'),
  showDialog: createAction('SHOW_DIALOG'),
};

const initialState = {
  title: '',
  counter: 0,
};

const reducer = createReducer(initialState, [
  createStateReducer(actions.inc, state => ({counter: state.counter + 1})),
  createStateReducer(actions.showDialog, state => ({dialogVisible: true})),
]);
```

<!--With ramda-->

```js
import {createReducer, actionType, createAction} from '@k-frame/core';
import {assoc, over, lensProp, compose, add} from 'ramda';

const actions = {
  inc: createAction('INC'),
  showDialog: createAction('SHOW_DIALOG'),
};

const initialState = {
  title: '',
  counter: 0,
};

const reducer = createReducer(initialState, [
  createStateReducer(actions.inc, over(lensProp('counter'), add(1))),
  createStateReducer(actions.showDialog, assoc('dialogVisible', true)),
]);
```

<!--END_DOCUSAURUS_CODE_TABS-->

#### See also

- [createReducer](createReducer.md)
