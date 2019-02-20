---
id: api-action
title: action
---

### `action(matcher, transform)`

Creates a `reducer` that transforms `state` only when `matcher` returns true for provided `action`.

- `matcher: action -> bool`

- `transform: payload -> state -> state` - transform specification

#### Example

In the following example, we nest a form reducer.

```javascript
import {createReducer, action,} from `@k-frame/reducers`;
import {propEq, assoc, over, lensProp, compose, add,} from 'ramda';

const initialState = {
    title: '',
    counter: 0,
};

const reducer = createReducer(
    initialState,
    [
        action(propEq('type', 'SET_TITLE'), assoc('title')),
        action(propEq('type', 'INC'), compose(over(lensProp('counter')), add)),
    ]
);

```

#### See also
* [createReducer](createReducer.md)
