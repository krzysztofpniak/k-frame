---
id: api-scope
title: Scope
---

### `<Scope scope={string}>{...}</Scope>`

Defines scope of nested Components

- `scope: String`

#### Example

In the following example, we create two action creators

```javascript
import {Scope} from '@k-frame/core';

const App = () => (
  <Scope name="app">
    <Scope name="page1">
      <Counter scope="c1" />
    </Scope>
  </Scope>
);
```

#### See also

- [withScope](withScope.md)
