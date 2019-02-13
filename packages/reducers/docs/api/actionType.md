### `actionType(type, transform)`

Creates a `reducer` that transforms `state` only when action types matches `type`.

- `type: String`

- `transform: payload -> state -> state` - transform specification

#### Example

In the following example, we use two `actionType`'s to define a reducer.
First one is taking care about action of type `SET_TITLE` and uses its `payload`
to set `title` property of the state.
Second one watches for `INC` action and increments `counter` prop by the value of `payload`.

```javascript
import {createReducer, actionType,} from `k-reducer`;
import {assoc, over, lensProp, compose, add,} from 'ramda';

const initialState = {
    title: '',
    counter: 0,
};

const reducer = createReducer(
    initialState,
    [
        actionType('SET_TITLE', assoc('title')),
        actionType('INC', compose(over(lensProp('counter')), add)),
    ]
);

```

#### See also
* [createReducer](createReducer.md)
