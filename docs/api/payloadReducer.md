---
id: api-payloadReducer
title: payloadReducer
---

### `payloadReducer(type, transform)`

Creates a `reducer` that transforms `state` only when action types matches `type`.

- `type: String`

- `transform: payload -> state -> state` - transform specification

#### Example

In the following example, we use two `payloadReducer`'s to define a reducer.
First one is taking care about action of type `SET_TITLE` and uses its `payload`
to set `title` property of the state.
Second one watches for `INC` action and increments `counter` prop by the value of `payload`.

```javascript
import {createReducer, payloadReducer,} from `@k-frame/reducers`;
import {assoc, over, lensProp, compose, add,} from 'ramda';

const initialState = {
    title: '',
    counter: 0,
};

const reducer = createReducer(
    initialState,
    [
        payloadReducer('SET_TITLE', assoc('title')),
        payloadReducer('INC_BY', compose(over(lensProp('counter')), add)),
    ]
);

```

#### See also
* [createReducer](createReducer.md)
