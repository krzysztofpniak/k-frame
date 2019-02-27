import React from 'react';
import {Scope} from '@k-frame/core';
import {Form} from '@k-frame/forms';

const schema = [
  {id: 'firstName', title: 'First Name'},
  {id: 'lastName', title: 'Last Name'},
  {id: 'email', title: 'Email'},
];

const UserEdit = ({match, history}) => (
  <Scope scope="userEdit">
    <div>
      <h3>{match.params.userId}</h3>
      <Form
        scope="form"
        schema={schema}
        onReset={() => history.push('/users')}
      />
    </div>
  </Scope>
);

export default UserEdit;
