import React, {memo, useCallback} from 'react';
import {Form} from '../../../src/main';
import {required} from '../../../src/validators';
import {
  Scope,
  withScope,
  useKReducer,
  createReducer,
  createStateReducer,
} from '@k-frame/core';
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
    props: ({fields: {age}, args: {color}}) => ({age, color}),
    validate: [
      required,
      (v, {color}, useMemo) => {
        const message = useMemo(
          () =>
            console.log('color message recalculated') ||
            `Color is different than ${color}`,
          [color]
        );
        return v !== color ? message : '';
      },
    ],
    visible: props => console.log(props) || props.age < 25,
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
    props: ({fields: {password}}) => ({password}),
    validate: [
      (v, {password}) => (v !== password ? `Passwords must match` : ''),
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
    <div style={{fontFamily: 'Arial, Helvetica'}}>{title}</div>
    <div>{input}</div>
    <div style={{color: 'red', fontFamily: 'Arial, Helvetica'}}>{error}</div>
  </div>
);

const FormTemplate = ({buttons, fields, color, onSubmit}) => (
  <form onSubmit={onSubmit}>
    <div
      style={{
        border: `2px solid ${color}`,
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
  createStateReducer(appActions.nextColor, s => ({
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

const getColorArg = ({args: {color}}) => ({color});

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
      <SimpleForm
        scope="form1"
        color={colors[colorIndex]}
        onSubmit={handleSubmit}
      />
      <div>Second Form</div>
      <Form
        scope="form2"
        schema={schema2}
        fieldTypes={fieldTypes}
        fieldTemplate={Row}
        formTemplate={FormTemplate}
        formTemplateProps={getColorArg}
        buttonsTemplate={Button}
        args={{color: colors[colorIndex]}}
        onSubmit={handleSubmit}
      />
    </Scope>
  );
};

export default App;
