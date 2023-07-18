import React, {useCallback, useRef, useState} from 'react';
import {linkTo} from '@storybook/addon-links';
import fieldTypes from '../../examples/common/fieldTypes';
import {Form} from '../view';
import kFrameDecorator from './helpers/kFrameDecorator';
import {withStaticScope, useKReducer, createReducer} from '@k-frame/core';

export default {
  title: 'Complex Component',
  component: Form,
  decorators: [kFrameDecorator],
};

const schema = [
  {
    id: 'connection',
  },
  {
    id: 'fullName',
    title: 'Full Name',
    type: 'complexField',
    defaultValue: {first: ['John Brown'], second: ['dupa', 'x']},
  },
];

const reducer = createReducer({}, []);

export const ComplexComponent = withStaticScope('outerScope')(() => {
  const {} = useKReducer(reducer);

  return (
    <Form scope="complexComponent" schema={schema} fieldTypes={fieldTypes} />
  );
});
