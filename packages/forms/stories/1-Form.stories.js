import React, {useCallback, useRef, useState} from 'react';
import {linkTo} from '@storybook/addon-links';
import fieldTypes from '../examples/common/fieldTypes';
import {Form} from '../src/view';
import {required} from '../src/validators';
import kFrameDecorator from './helpers/kFrameDecorator';

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
    validate: (_, {fieldErrors}) =>
      fieldErrors.length > 0 ? 'Fix errors above' : '',
  },
];

export const ComplexValidation = () => {
  const form = useRef({});

  const externalApiCall = useCallback(() => {
    const {validate, getFields} = form.current;
    const errors = validate();
    alert(JSON.stringify(errors.length ? errors : getFields()));
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
