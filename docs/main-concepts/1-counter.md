---
id: counter
title: Counter
---

Hello World doesn't make any sense in k-frame, because it is just a static text.
The simplest k-frame example is a Counter.

<!--DOCUSAURUS_CODE_TABS-->
<!--Plain JS-->
```js
import React from 'react';
import {createReducer, stateReducer} from '@k-frame/reducers';
import {useKReducer, withScope} from '@k-frame/core';

const counterActions = {
  inc: () => ({type: 'increment'}),
};

const counterReducer = createReducer({counter: 0}, [
  stateReducer(counterActions.inc, s => ({...s, counter: s.counter + 1})),
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
import {createReducer, stateReducer} from '@k-frame/reducers';
import {useKReducer, withScope} from '@k-frame/core';

const counterActions = {
  inc: () => ({type: 'increment'}),
};

const counterReducer = createReducer({counter: 0}, [
  stateReducer(counterActions.inc, over(lensProp('counter'), add(1))),
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


<!--END_DOCUSAURUS_CODE_TABS-->
