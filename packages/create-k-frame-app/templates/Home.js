import React from 'react';
import logo from './logo.svg';
import Counter from './Counter';

const Home = () => (
  <div>
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
      <a
        className="App-link"
        href="https://k-frame.org"
        target="_blank"
        rel="noopener noreferrer"
      >
        Learn k-frame
      </a>
      <Counter scope="counter1" />
    </header>
  </div>
);

export default Home;
