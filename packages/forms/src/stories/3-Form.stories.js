import React, {useCallback} from 'react';
import fieldTypes from '../../examples/common/fieldTypes';
import {Form} from '../view';
import kFrameDecorator from './helpers/kFrameDecorator';
import {createReducer, useKReducer, withStaticScope} from '@k-frame/core';
import {useScheduler} from '@k-frame/core';
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

  const scheduler = useScheduler();

  const addToQueue = useCallback(() => {
    scheduler.enqueueLabeled({key: Math.random()})(chain(encase(console.log))(after(2000)('sd')));
  }, []);

  return (
    <div>
      <button onClick={addToQueue}>add something to scheduler queue</button>
      <div>{scheduler.pending ? 'true' : 'false'}</div>
      <Form
        scope="complexComponent"
        schema={schema}
        fieldTypes={fieldTypes}
        resetOnSubmit={false}
        onValidated={e => alert(JSON.stringify(e))}
        scheduler={scheduler}
      />
    </div>
  );
});
