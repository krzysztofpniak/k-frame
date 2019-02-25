---
id: api-createAction
title: createAction
---

### `createAction(type, payloadCreator)`

Creates an action creator with bound type.

- `type: String`

- `payloadCreator: function` - optional payload creator

#### Example

In the following example, we create two action creators

```javascript
import {createAction} from '@k-frame/core';

const setTitle = createAction('SetTitle');
const setPoint = createAction('SetPoint', (x, y) => ({x, y}));

setTitle('Hello');
// {type: 'SetTitle', payload: 'Hello'}
setPoint(10, 20);
// {type: 'SetTitle', payload: {x: 10, y: 20}}
```

#### See also

- [createReducer](createReducer.md)
