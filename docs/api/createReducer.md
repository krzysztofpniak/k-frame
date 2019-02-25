---
id: api-createReducer
title: createReducer
---

### `createReducer(initialState, spec)`

Creates a `reducer` defined by `spec` with `initialState`.

- `initialState: Object | Array | String`

- `spec: Array<reducer>` - reducer specification

#### Example

In the following example, we create a basic reducer. We can use `createReducer`
to compose any reducers we have.

```javascript
import {createReducer, createPayloadReducer, createAction} from '@k-frame/core';

const initialState = {
  title: '',
  counter: 0,
};

const classicReducer = (state, action) => {
  switch (action.type) {
    case 'INC':
      return {
        ...state,
        counter: state.counter + action.payload,
      };
    default:
      return state;
  }
};

const toggleDialog = createAction('TOGGLE_DIALOG');

const reducer = createReducer(initialState, [
  reduxFormReducer,
  classicReducer,
  createPayloadReducer('SET_TITLE', assoc('title')),
  createPayloadReducer(toggleDialog, assoc('dialogVisible')),
]);
```

#### Notes

For convenience this library defines reducer factories, that can be used
directly in `createReducer` spec:

- [createPayloadReducer](createPayloadReducer.md)
- [createStateReducer](createStateReducer.md)
