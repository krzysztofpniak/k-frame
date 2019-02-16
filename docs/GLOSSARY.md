# Glossary

This is a glossary of the core terms in @k-frame/reducers.

## Reducer

A plain function that has a following signature:

```
(state, action) -> state
```

In other words it is a function that takes some state, some action, and returns new state evolved by action.

example

```javascript
const incBy = (state = 0, action) => {
  if (action.type === 'INC') {
    return state += action.payload;
  } else {
    return state;
  }
}

const state = 10;
const newState = incBy(state, {type: INC, payload: 4}); // 14

```
