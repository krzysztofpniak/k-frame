---
id: add-k-frame
title: Add k-frame to a Website
---
*Use as little or as much k-frame as you need.*

k-frame has been designed from the start for gradual adoption, and you can
use as little or as much k-frame as you need. Perhaps you only want to
simplify logic on some parts of an existing page.
k-frame hooks and reducer helpers are a great way to do that.

## Add k-frame in One Minute

In this section, we will show how to add a k-frame component to an existing
React application. You can follow along with your own website,
or create new React application using create-react-app.

```js
import React from 'react';
import ReactDOM from 'react-dom';

import { KProvider } from '@k-frame/core';
import store from './store';

import App from './App';

const rootElement = document.getElementById('root');

ReactDOM.render(
  <KProvider store={store}>
    <App />
  </KProvider>,
  rootElement
);
```

## What if I have redux in my app?

You might already have redux integrated. It is not a problem. All you
you have to do is to use KProvider wrapper. **In this scenario the most important
part is to pass appReducer to KProvider**. There are no performance issues
and you don't have to worry about it.

```js
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { KProvider } from '@k-frame/core';
import store from './store';

import App from './App';
import appReducer from './appReducer';

const rootElement = document.getElementById('root');

ReactDOM.render(
  <KProvider
    store={store}
    staticReducer={appReducer}
  >
    <Provider store={store}>
      <App />
    </Provider>
  </KProvider>,
  rootElement
);
```

[![Edit z6xr12wlp](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/z6xr12wlp)