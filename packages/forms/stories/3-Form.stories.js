import React, {useCallback} from 'react';
import fieldTypes from '../examples/common/fieldTypes';
import {Form} from '../src/view';
import kFrameDecorator from './helpers/kFrameDecorator';
import {createReducer, useKReducer, withStaticScope} from '@k-frame/core';
import {useQueue} from '@k-frame/core';
import {after, chain, encase} from 'fluture';

export default {
  title: 'Scheduler(async inputs)',
  component: Form,
  decorators: [kFrameDecorator],
};

const schema = [
  {
    id: 'fullName',
    title: 'Full Name',
    type: 'asyncField',
    defaultValue: 'type something',
  },
];

const reducer = createReducer({}, []);

export const ComplexComponent = withStaticScope('outerScope')(() => {
  const {} = useKReducer(reducer);

  const scheduler = useQueue();

  const addToQueue = useCallback(() => {
    scheduler.enqueue(after(1000)('sd') |> chain(encase(console.log)));
  }, []);

  return (
    <div>
      <button onClick={addToQueue}>add</button>
      <div>{scheduler.pending ? 'true' : 'false'}</div>
      <Form
        scope="complexComponent"
        schema={schema}
        fieldTypes={fieldTypes}
        resetOnSubmit={false}
        onValidated={e => e |> JSON.stringify |> alert}
        scheduler={scheduler}
      />
    </div>
  );
});
