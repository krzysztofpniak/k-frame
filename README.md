# k-frame

[![@k-frame/core](https://img.shields.io/npm/v/@k-frame/core.svg?label=%40k-frame%2Fcore)](https://www.npmjs.com/package/@k-frame/core)
[![@k-frame/forms](https://img.shields.io/npm/v/@k-frame/forms.svg?label=%40k-frame%2Fforms)](https://www.npmjs.com/package/@k-frame/forms)
[![@k-frame/sagas](https://img.shields.io/npm/v/@k-frame/sagas.svg?label=%40k-frame%2Fsagas)](https://www.npmjs.com/package/@k-frame/sagas)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](#license)

A complete React and Redux based framework.

k-frame lets a component own a slice of the Redux store. A reducer is attached
to the store's reducer tree when the component mounts, under a **scope** — so
state lives next to the component that uses it. No action-type constants, no
`mapStateToProps`, no hand-wiring a root reducer.

```js
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

Rendering `<Counter scope="c1" />` mounts that reducer at `c1` in the store, and
`inc()` dispatches `c1.INC`. Render it twice with different scopes and you get
two independent counters from the same reducer.

## Packages

This is a monorepo (Yarn workspaces + Lerna).

| Package                                             | Description                                                                  |
| --------------------------------------------------- | ---------------------------------------------------------------------------- |
| [`@k-frame/core`](packages/core)                    | Scoped reducers, hooks, action and async helpers. The only required package. |
| [`@k-frame/forms`](packages/forms)                  | Schema-driven forms built on core.                                           |
| [`@k-frame/sagas`](packages/sagas)                  | Scope-aware [`redux-saga`](https://redux-saga.js.org/) integration.          |
| [`create-k-frame-app`](packages/create-k-frame-app) | Scaffolds a new app on top of `create-react-app`.                            |

## Requirements

React 16.8 or later (k-frame is hooks-based), plus `redux` and `ramda` as peer
dependencies.

## Install

```sh
yarn add @k-frame/core ramda redux
```

or

```sh
npm install --save @k-frame/core ramda redux
```

Add `@k-frame/forms` and `@k-frame/sagas` as needed.

To start from scratch instead:

```sh
npx create-k-frame-app my-app
cd my-app
npm start
```

## Getting started

### 1. Create a store and wrap the app

`KProvider` calls `store.replaceReducer` as components mount, so give it a store
you are happy to have reshaped. `emptyReducer` is a fine starting point.

```js
import React from 'react';
import ReactDOM from 'react-dom';
import {createStore} from 'redux';
import {KProvider, emptyReducer} from '@k-frame/core';

import App from './App';

const store = createStore(emptyReducer);

ReactDOM.render(
  <KProvider store={store}>
    <App />
  </KProvider>,
  document.getElementById('root')
);
```

### 2. Already using Redux?

Pass your existing root reducer as `staticReducer`. k-frame composes its scoped
reducers on top of it, so `react-redux` keeps working unchanged.

```js
<KProvider store={store} staticReducer={appReducer}>
  <Provider store={store}>
    <App />
  </Provider>
</KProvider>
```

### 3. Scopes

A scope is a path into the store. `withScope` reads it from the component's
`scope` prop; `<Scope>` sets one for a whole subtree. They nest:

```js
import {Scope} from '@k-frame/core';

const App = () => (
  <Scope scope="app">
    <Scope scope="page1">
      <Counter scope="c1" />
    </Scope>
  </Scope>
);
```

The counter's state now lives at `app.page1.c1` and its actions dispatch as
`app.page1.c1.INC`.

## Forms

`@k-frame/forms` renders a form from a schema. You supply `fieldTypes` — a map
of type name to component — so the markup stays yours.

```js
import {Form} from '@k-frame/forms';

const required = () => value =>
  (value || '').length === 0 ? 'This field is required' : '';

const schema = [
  {id: 'name', title: 'Name', defaultValue: 'John'},
  {id: 'surname', title: 'Surname', defaultValue: '', validate: required()},
  {
    id: 'displayName',
    title: 'Display Name',
    type: 'static',
    props: ({fields: {name, surname}}) => ({value: `${name} ${surname}`}),
  },
];

const MyForm = () => (
  <Form scope="s1" autoFocus schema={schema} fieldTypes={fieldTypes} />
);
```

Each schema entry accepts `id`, `title`, `type`, `defaultValue`, `validate`
(one validator or an array), `format`, `parse`, `disabled`, and two functions of
the form context — `props` and `visible` — which is how fields react to sibling
values or to `args` passed into the `Form`.

Useful `Form` props: `schema`, `fieldTypes`, `args`, `onSubmit`, `onReset`,
`autoFocus`, `disabled`, `errorsDisplayStrategy`, `resetOnSubmit`,
`resetOnCancel`, `submitText`, `cancelText`, and the `formTemplate` /
`fieldTemplate` / `buttonsTemplate` overrides.

A validator is just `value => errorMessage`, returning an empty string when the
value is fine. `errorsDisplayStrategy` is likewise a plain predicate over form
state deciding when a field's error becomes visible; it defaults to "once the
field has been touched, or once submit has been attempted".

```js
const onSubmitStrategy = ({submitRequested}) => submitRequested;
```

A `ref` on the `Form` exposes an imperative API, including `validate()` and
`getFields()`:

```js
const form = useRef({});

const submit = () => {
  const errors = form.current.validate();
  if (!errors.length) {
    send(form.current.getFields());
  }
};

<Form scope="imperative" ref={form} schema={schema} fieldTypes={fieldTypes} />;
```

## Sagas

Apply `scopedSagaMiddleware` to the store and hand its `run` to `KProvider`:

```js
import {createStore, applyMiddleware} from 'redux';
import {KProvider, emptyReducer} from '@k-frame/core';
import {scopedSagaMiddleware} from '@k-frame/sagas';

const store = createStore(emptyReducer, applyMiddleware(scopedSagaMiddleware));

<KProvider store={store} runSaga={scopedSagaMiddleware.run}>
  <App />
</KProvider>;
```

`useSaga` then runs a saga inside the current scope for the lifetime of the
component, cancelling it on unmount. `useSagaRunner` gives you `fork`/`cancel`
plus the state of each running task.

## Async

`useAsync(fn, key)` wraps a promise-returning function and dispatches
`async/<key>/request`, `.../succeeded` and `.../failed` around it.
`handleAsyncs` turns those into state:

```js
const reducer = handleAsyncs({users: {}});
// => data.users === {pending: false, result: null, error: null}
```

Pass `defaultValue` per resource, or a custom lens, to control where each stage
is written.

## API

### `@k-frame/core`

- **Provider** — `KProvider`, `KContext`
- **Scoping** — `Scope`, `withScope`, `withStaticScope`, `useScopeProps`
- **Reducers** — `createReducer`, `createStateReducer`, `createPayloadReducer`,
  `composeReducers`, `emptyReducer`, `fromTree`, `nest`
- **Actions** — `createAction`, `bindActionCreators`, `wrapAction`, `forwardTo`,
  `requestAction`, `succeededAction`, `chunkAction`, `failedAction`
- **Hooks** — `useKReducer`, `useAsync`, `usePrevious`, `useWithArgs`,
  `useInputTargetValue`
- **Async state** — `handleAsyncs`
- **Utilities** — `withDebug`, `withMemoContext`, `shallowEqual`,
  `arePropsEqual`

### `@k-frame/forms`

`Form` and `reset` — that is the entire published surface. The built-in
validators and error-display strategies exist in `src/` but are not re-exported
from `src/main.js`, so pass your own as plain functions (see above).

### `@k-frame/sagas`

`scopedSagaMiddleware`, `useSaga`, `useSagaRunner`, `asyncAction`,
`asyncSubscribe`.

## Documentation

Longer guides live in [`docs/`](docs) — [adding k-frame to an existing
app](docs/installation/2-add-k-frame.md), [the counter
walkthrough](docs/main-concepts/1-counter.md) and per-function pages under
[`docs/api/`](docs/api).

Runnable examples are in [`packages/forms/examples`](packages/forms/examples)
and in the Storybook stories under each package.

## Development

```sh
yarn                # install
yarn bootstrap      # lerna bootstrap --hoist
yarn test           # jest, all packages
yarn test:cov       # with coverage
yarn storybook      # component explorer on :6006
```

Tests are picked up from `packages/*/tests/*.spec.js`. Formatting is Prettier
(`.prettierrc`). `website/` holds the Docusaurus site sources.

## License

MIT © Krzysztof Pniak
