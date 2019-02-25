---
id: api-createPayloadReducer
title: createPayloadReducer
---

### `createPayloadReducer(type, transform)`

Creates a `reducer` that transforms `state` only when action types matches `type`.

- `type: String`

- `transform: payload -> state -> state` - transform specification

#### Example

In the following example, we use two `createPayloadReducer`'s to define a reducer.
First one is taking care about action of type `SET_TITLE` and uses its `payload`
to set `title` property of the state.
Second one watches for `INC_BY` action and increments `counter` prop by the value of `payload`.

```javascript
import {createReducer, createAction, createPayloadReducer} from '@k-frame/core';

import {assoc, over, lensProp, compose, add} from 'ramda';

const actions = {
  setTitle: createAction('SET_TITLE'),
  incBy: createAction('INC_BY'),
};

const initialState = {
  title: '',
  counter: 0,
};

const reducer = createReducer(initialState, [
  createPayloadReducer(actions.setTitle, assoc('title')),
  createPayloadReducer(
    actions.incBy,
    compose(
      over(lensProp('counter')),
      add
    )
  ),
]);
```

#### See also

- [createReducer](createReducer.md)
