//import kFrameDecorator from './helpers/kFrameDecorator';
import React from 'react';
import {Form} from '../src/view';
import S_ from 'sanctuary';
import {action} from '@storybook/addon-actions';
import {evolve, pipe} from 'ramda';
import {Input} from "./stories/input";
import kFrameDecorator from "../stories/helpers/kFrameDecorator";

const S = S_.create({
  checkTypes: false,
  env: [],
});

export default {
  title: 'Internal Validation',
  component: Form,
  decorators: [kFrameDecorator],
};

const schema = [
  {
    id: 'age',
    validate: S.fromLeft(''),
    defaultValue: S.Right(23),
  },
];


const fieldTypes = {text: Input};

export const Basic = {
  args: {
    scope: 'basic',
    schema,
     fieldTypes,
     onValidated: pipe(
       evolve({age: S.fromRight('')}) , action('onValidated')),
  },
};
