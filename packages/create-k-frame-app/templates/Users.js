import {Link, Route} from 'react-router-dom';
import React, {lazy} from 'react';

const UserEdit = lazy(() =>
  import(/* webpackChunkName: "user-edit" */ './UserEdit')
);

const UsersList = ({match}) => (
  <div>
    <h2>Topics</h2>
    <ul>
      <li>
        <Link to={`${match.url}/rendering`}>Rendering with React</Link>
      </li>
      <li>
        <Link to={`${match.url}/components`}>Components</Link>
      </li>
      <li>
        <Link to={`${match.url}/props-v-state`}>Props v. State</Link>
      </li>
    </ul>
  </div>
);

const Users = ({match}) => (
  <div>
    <Route path={`${match.path}/:userId`} component={UserEdit} />
    <Route exact path={match.path} component={UsersList} />
  </div>
);

export default Users;
