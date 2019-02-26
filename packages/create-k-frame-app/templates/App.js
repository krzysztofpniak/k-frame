import React from 'react';
import Counter from './Counter';
import {Scope} from '@k-frame/core';
import logo from './logo.svg';
import './App.css';

const App = () => (
  <Scope scope="app">
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <Counter scope="counter1" />
      </header>
    </div>
  </Scope>
);

export default App;
