import React, {useCallback, useRef, useState} from 'react';
import {linkTo} from '@storybook/addon-links';
import fieldTypes from '../examples/common/fieldTypes';
import {Form} from '../src/view';
import {required} from '../src/validators';
import kFrameDecorator from './helpers/kFrameDecorator';
import {fork, rejectAfter} from 'fluture';

const delayedValue = v =>
  new Promise(resolve => setTimeout(() => resolve(v), 1000));

export default {
  title: 'Complex',
  component: Form,
  decorators: [kFrameDecorator],
};

const schema = [
  {
    id: 'fullName',
    title: 'Full Name',
    type: 'fullName',
    defaultValue: 'John Brown',
    //validate: (value, ctx) => 'błąd' |> rejectAfter(1000),
    format: value => value,
  },
];

export const ComplexValidation = () => {
  const form = useRef({});

  const externalApiCall = useCallback(() => {
    const {validateFuture, getFields} = form.current;
    //const errors = validateFuture |> fork(console.error)(console.log);
    //alert(JSON.stringify(errors.length ? errors : getFields()));
  }, []);

  return (
    <div>
      <button onClick={externalApiCall}>Validate</button>
      <Form
        scope="imperative"
        ref={form}
        schema={schema}
        fieldTypes={fieldTypes}
      />
    </div>
  );
};
