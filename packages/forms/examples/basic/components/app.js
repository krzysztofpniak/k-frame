import React, {memo, useCallback} from 'react';
import {Form} from '../../../src/main';
import {required} from '../../../src/validators';
import {createReducer, actionType2} from '@k-frame/reducers';
import {Scope, withScope, useKReducer} from '@k-frame/core';
import {over, lensProp, add, compose, times} from 'ramda';
import SimpleForm from '../../common/simpleForm';
import fieldTypes from '../../common/fieldTypes';

const parseIntNull = v => {
  const parsed = parseInt(v, 10);
  return isNaN(parsed) ? null : parsed;
};

const schema2 = [
  {
    id: 'name',
    title: 'Name',
    validate: required,
  },
  {
    id: 'age',
    title: 'Age',
    defaultValue: 10,
    parse: parseIntNull,
    format: v => (v ? v : ''),
    onChange: console.log,
    validate: v => (v < 18 ? 'At least 18 years' : null),
  },
  {
    id: 'color',
    title: 'Favorite Color',
    defaultValue: '',
    validate: [
      required,
      (v, {args: {color}}) =>
        v !== color ? `Color is different than ${color}` : '',
    ],
  },
  {
    id: 'password',
    title: 'Password',
    type: 'password',
    defaultValue: '',
    validate: required,
  },
  {
    id: 'passwordConfirm',
    title: 'Password Confirm',
    type: 'password',
    defaultValue: '',
    validate: [
      (v, {fields: {password}}) =>
        v !== password ? `Passwords must match` : '',
    ],
  },
];

const validateColor = [
  required,
  (v, {args: {color}}) =>
    v !== color ? `Color is different than ${color}` : '',
];

const schema3 = times(
  idx => ({id: `field${idx}`, title: `Field ${idx}`, validate: validateColor}),
  100
);

const Row = ({input, title, error}) => (
  <div style={{margin: '10px 0'}}>
    <div>{title}</div>
    <div>{input}</div>
    <div style={{color: 'red'}}>{error}</div>
  </div>
);

const FormTemplate = ({buttons, fields, args, onSubmit}) => (
  <form onSubmit={onSubmit}>
    <div
      style={{
        border: `2px solid ${args.color}`,
        borderRadius: '5px',
        padding: '10px',
      }}
    >
      {buttons}
      {fields.default}
      {buttons}
    </div>
  </form>
);

const Button = ({onSubmit, onReset}) => (
  <div>
    <button onClick={onSubmit} type="submit">
      Commit
    </button>
  </div>
);

const colors = ['red', 'green', 'blue'];

const appActions = {
  nextColor: () => ({type: 'NextColor'}),
};

const appReducer = createReducer({colorIndex: 0}, [
  actionType2(appActions.nextColor, s => ({
    ...s,
    colorIndex: (s.colorIndex + 1) % colors.length,
  })),
]);

const SimpleButton = memo(({text, onClick, color}) => (
  <button
    type="button"
    onClick={onClick}
    style={{backgroundColor: color, color: 'white'}}
  >
    {text}
  </button>
));

const App = () => {
  const {colorIndex, nextColor} = useKReducer(appReducer, appActions);
  const handleSubmit = useCallback((defaultSubmitHandler, fields) => {
    const errors = defaultSubmitHandler();
    if (errors.length === 0) {
      alert(JSON.stringify(fields, null, 2));
    }
  }, []);

  return (
    <Scope scope="app">
      <SimpleButton
        text="Next Color"
        onClick={nextColor}
        color={colors[colorIndex]}
      />
      <div>First Form</div>
      <SimpleForm scope="form1" color={colors[colorIndex]} />
      <div>Second Form</div>
      <Form
        scope="form2"
        schema={schema2}
        fieldTypes={fieldTypes}
        formGroupTemplate={Row}
        formTemplate={FormTemplate}
        buttonsTemplate={Button}
        args={{color: colors[colorIndex]}}
        onSubmit={handleSubmit}
      />
    </Scope>
  );
};

export default App;
