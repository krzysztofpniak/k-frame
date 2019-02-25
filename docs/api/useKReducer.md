---
id: api-useKReducer
title: useKReducer
---

### `useKReducer(reducer, actions)`

Attaches reducer to reducers tree using current [Scope](scope.md)

- `reducer: Reducer`

- `actions: object` - object with actionCreators as values

### returns

It returns object of state mixed with actions bound to dispatch.

#### Example

In the following example, we create two action creators

<!--DOCUSAURUS_CODE_TABS-->
<!--Plain JS-->

```js
import React from 'react';
import {
  useKReducer,
  withScope,
  createReducer,
  createStateReducer,
  createAction,
} from '@k-frame/core';

const counterActions = {
  inc: createAction('INC'),
};

const counterReducer = createReducer({counter: 0}, [
  createStateReducer(counterActions.inc, s => ({...s, counter: s.counter + 1})),
]);

const Counter = withScope(() => {
  const {counter, inc} = useKReducer(counterReducer, counterActions);

  return (
    <button type="button" onClick={inc}>
      Clicked {counter} times
    </button>
  );
});
```

<!--With ramda-->

```js
import React from 'react';
import {
  useKReducer,
  withScope,
  createReducer,
  createStateReducer,
  createAction,
} from '@k-frame/core';

const counterActions = {
  inc: createAction('INC'),
};

const counterReducer = createReducer({counter: 0}, [
  createStateReducer(counterActions.inc, over(lensProp('counter'), add(1))),
]);

const Counter = withScope(() => {
  const {counter, inc} = useKReducer(counterReducer, counterActions);

  return (
    <button type="button" onClick={inc}>
      Clicked {counter} times
    </button>
  );
});
```

<!--switch reducer-->

```js
import React from 'react';
import {
  useKReducer,
  withScope,
  createReducer,
  createStateReducer,
  createAction,
} from '@k-frame/core';

const counterActions = {
  inc: createAction('INC'),
};

const initialState = {counter: 0};

const counterReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'INC':
      return {
        ...state,
        counter: state.counter + 1,
      };
    default:
      return state;
  }
};

const Counter = withScope(() => {
  const {counter, inc} = useKReducer(counterReducer, counterActions);

  return (
    <button type="button" onClick={inc}>
      Clicked {counter} times
    </button>
  );
});
```

<!--END_DOCUSAURUS_CODE_TABS-->

#### See also

- [createReducer](createReducer.md)
