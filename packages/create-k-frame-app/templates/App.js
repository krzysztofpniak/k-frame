import React, {Suspense, lazy} from 'react';
import {Scope} from '@k-frame/core';
import {BrowserRouter as Router, Route, Link} from 'react-router-dom';
import './App.css';

const Home = lazy(() => import(/* webpackChunkName: "home" */ './Home'));
const Users = lazy(() => import(/* webpackChunkName: "home" */ './Users'));

const About = () => (
  <div>
    <h2>About</h2>
  </div>
);

const App = () => (
  <Scope scope="app">
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <div className="App">
          <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
            <a className="navbar-brand col-sm-3 col-md-2 mr-0" href="#">
              k-frame app example
            </a>
          </nav>
          <div className="container-fluid">
            <div className="row">
              <nav className="col-md-2 d-none d-md-block bg-light sidebar">
                <div className="sidebar-sticky">
                  <ul className="nav flex-column">
                    <li className="nav-item">
                      <Link className="nav-link" to="/">
                        Home
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link to="/users" className="nav-link">
                        Users
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/about">
                        About
                      </Link>
                    </li>
                  </ul>
                </div>
              </nav>
              <main role="main" className="col-md-9 ml-sm-auto col-lg-10 px-4">
                <Route exact path="/" component={Home} />
                <Route path="/about" component={About} />
                <Route path="/users" component={Users} />
              </main>
            </div>
          </div>
        </div>
      </Suspense>
    </Router>
  </Scope>
);

export default App;
