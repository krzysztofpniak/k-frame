### `nest(type, subReducer)`

Creates an isolated `reducer` defined by `subReducer` in `type` scope in state.

- `type: String`

- `subReducer: reducer` - reducer specification

#### Example

In the following example, we nest a form reducer.

```javascript
import { createReducer, nest, } from `@k-frame/reducers`;

const reducer = createReducer(
    {},
    [
        nest('form', formReducer),
    ]
);

```

test

{% codesandbox %}
https://codesandbox.io/embed/zlmzlpwz6l?hidenavigation=1&view=preview
{% endcodesandbox %}

#### See also
* [createReducer](createReducer.md)
