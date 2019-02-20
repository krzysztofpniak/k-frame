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
import {createReducer, actionType,} from `@k-frame/reducers`;

const initialState = {
    title: '',
    counter: 0,
};

const rawReducer = (state, action) =>
    action.type === 'INC' ? {
        ...state,
        counter: state.counter + action.payload
    } : state;

const reducer = createReducer(
    initialState,
    [
        reduxFormReducer,
        actionType('SET_TITLE', assoc('title')),
        rawReducer,
    ]
);

```

#### Notes

For convenience this library defines reducer factories, that can be used
directly in `createReducer` spec:
* [action](action.md)
* [actionType](actionType.md)
* [nest](nest.md)
