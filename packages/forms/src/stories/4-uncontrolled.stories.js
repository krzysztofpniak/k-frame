import React, {useRef} from 'react';
import fieldTypes from '../../examples/common/fieldTypes';
import {Form} from '../view';
import kFrameDecorator from './helpers/kFrameDecorator';
import {createReducer, useKReducer, withStaticScope} from '@k-frame/core';

export default {
  title: 'Uncontrolled Component',
  component: Form,
  decorators: [kFrameDecorator],
};

const schema = [
  {
    id: 'connection',
  },
  {
    id: 'uncontrolledField',
    type: 'uncontrolledField',
    defaultValue: 'Staszek',
    props: ({args: {uncontrolledRef}}) => ({
      ref: uncontrolledRef,
    }),
  },
];

const reducer = createReducer({}, []);

export const Basic = withStaticScope('outerScope')(() => {
  const {} = useKReducer(reducer);
  const formRef = useRef();
  const uncontrolledRef = useRef();

  return (
    <div>
      <Form
        ref={formRef}
        scope="complexComponent"
        schema={schema}
        fieldTypes={fieldTypes}
        args={{uncontrolledRef}}
      />
      <button
        onClick={() =>
          formRef.current.setFields({uncontrolledField: 'Zdzisław'})
        }
      >
        Set Fields
      </button>

      <button onClick={() => uncontrolledRef.current.setValue('Marzena')}>
        Set Value
      </button>
    </div>
  );
});
