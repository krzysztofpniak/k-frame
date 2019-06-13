import React, {memo, useCallback, useEffect, useState} from 'react';
import {makeStyles, ThemeProvider} from '@material-ui/styles';
import Box from '@material-ui/core/Box';
import Skeleton from 'react-loading-skeleton';
import {map, assoc, evolve, always, propEq, find, mergeLeft} from 'ramda';
import {Form} from '../../src/main';
import fieldTypes from '../common/fieldTypes';
import {
  useKReducer,
  createAction,
  createReducer,
  createPayloadReducer,
  createStateReducer,
  handleAsyncs,
  useAsync,
} from '@k-frame/core';

const Cell = ({children}) => (
  <Box width={200} p={1}>
    {children}
  </Box>
);

const HCell = ({children}) => (
  <Box width={200} fontWeight="bold" p={1}>
    {children}
  </Box>
);

const initialUsers = [
  {
    id: '5cc5821cfe4d0c717d0ab6d9',
    firstName: 'Booker',
    lastName: 'Madden',
  },
  {
    id: '5cc5821cffd9368c74907002',
    firstName: 'Steele',
    lastName: 'Malone',
  },
  {
    id: '5cc5821cd1a75e95871dd4e1',
    firstName: 'Corina',
    lastName: 'Armstrong',
  },
  {
    id: '5cc5821c121606fad75c0366',
    firstName: 'Cross',
    lastName: 'Guerra',
  },
  {
    id: '5cc5821c2334bd375a8eea6e',
    firstName: 'Reynolds',
    lastName: 'Rios',
  },
];
const schema = [{id: 'firstName'}, {id: 'lastName'}];

const StaticRow = memo(({id, firstName, lastName, onToggleEdit, pending}) => {
  const handleToggleEdit = useCallback(() => onToggleEdit(id), []);
  return (
    <Box display="flex">
      <Cell>{pending ? <Skeleton /> : firstName}</Cell>
      <Cell>{pending ? <Skeleton /> : lastName}</Cell>
      <Box p={1}>
        <button type="button" onClick={handleToggleEdit}>
          Edit
        </button>
      </Box>
    </Box>
  );
});

const actions = {
  toggleEdit: createAction('toggleEdit'),
};

const initFields = fields =>
  evolve({
    fields: mergeLeft(fields),
    defaultValues: mergeLeft(fields),
  });

const reducer = createReducer({editedRow: ''}, [
  createPayloadReducer(actions.toggleEdit, (payload, state) =>
    evolve(
      {
        editedRow: always(payload),
        form: initFields(find(propEq('id', payload), state.data.users.result)),
      },
      state
    )
  ),
  handleAsyncs({
    users: {
      defaultValue: [],
    },
    userPut: {},
  }),
]);

const TableFormTemplate = ({fields, onSubmit, onReset}) => (
  <form>
    <Box display="flex">
      {fields.default}
      <Cell>
        <button type="submit" onClick={onSubmit}>
          Save
        </button>
        <button type="button" onClick={onReset}>
          Cancel
        </button>
      </Cell>
    </Box>
  </form>
);

const TableFieldTemplate = ({input}) => <Cell>{input}</Cell>;

const delayedResolve = (data, ms) =>
  new Promise(resolve => setTimeout(() => resolve(data), ms));

const createRestMockHook = (
  {resourceKey, itemKey, initialData, timeout} = {timeout: 1000, itemKey: 'id'}
) => () => {
  const saveAll = useCallback(data => {
    localStorage.setItem(resourceKey, JSON.stringify(data));
  }, []);

  const loadAll = useCallback(() => {
    try {
      const data = JSON.parse(localStorage.getItem(resourceKey)) || initialData;
      return data;
    } catch (e) {
      saveAll(initialData);
      return initialData;
    }
  }, []);

  const getAll = useCallback(() => {
    return delayedResolve(loadAll(), timeout);
  }, []);

  const getOne = useCallback(id => {
    const data = loadAll();
    const item = find(propEq(itemKey, id), data);
    return delayedResolve(item, timeout);
  }, []);

  const post = useCallback(itemData => {
    const data = loadAll();
    const newData = map(
      item => (item[itemKey] === itemData[itemKey] ? itemData : item),
      data
    );
    saveAll(newData);
    return delayedResolve(itemData, timeout);
  }, []);

  const put = useCallback(itemData => {
    const data = loadAll();
    const newData = map(
      item => (item[itemKey] === itemData[itemKey] ? itemData : item),
      data
    );
    saveAll(newData);
    return delayedResolve(itemData, timeout);
  }, []);

  const remove = useCallback(id => {
    const data = loadAll();
    const item = find(propEq(itemKey, id), data);
    return delayedResolve(item, timeout);
  }, []);

  return {
    getAll,
    getOne,
    post,
    put,
    remove,
  };
};

const useUsersApi = createRestMockHook({
  resourceKey: 'k-frame-callbacks-users',
  initialData: initialUsers,
  timeout: 500,
  itemKey: 'id',
});

const App = () => {
  const {
    toggleEdit,
    editedRow,
    data: {users, userPut},
  } = useKReducer(reducer, actions);
  const {getAll, post, put} = useUsersApi();
  const getUsers = useAsync(getAll, 'users');
  const putUser = useAsync(put, 'userPut');
  const updateUserAndReload = useCallback(async user => {
    await putUser(user);
    getUsers();
  });
  useEffect(() => {
    getUsers();
  }, []);

  return (
    <div>
      <h1>Callbacks Example</h1>
      <div>
        <div>
          <Box display="flex">
            <HCell>First Name</HCell>
            <HCell>Last Name</HCell>
          </Box>
        </div>
        <div>
          {map(
            user =>
              user.id === editedRow ? (
                <Form
                  key={user.id}
                  scope="form"
                  schema={schema}
                  fieldTypes={fieldTypes}
                  fieldTemplate={TableFieldTemplate}
                  formTemplate={TableFormTemplate}
                  onSubmit={(def, fields) => {
                    toggleEdit('');
                    updateUserAndReload(fields);
                  }}
                  onReset={def => {
                    toggleEdit('');
                  }}
                  autoFocus
                />
              ) : (
                <StaticRow
                  key={user.id}
                  id={user.id}
                  firstName={user.firstName}
                  lastName={user.lastName}
                  onToggleEdit={toggleEdit}
                  pending={users.pending || userPut.pending}
                />
              ),
            users.result
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
