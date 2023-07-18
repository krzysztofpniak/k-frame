import FormTemplateProxy from '../src/formTemplateProxy';
import {cleanup, render, act} from '@testing-library/react';
import React from 'react';
import {
  createObservableMock,
  wrapWithFormContext,
  createStoreMock,
} from './testData';

afterEach(cleanup);

describe('FormTemplateProxy', () => {
  it('should pass props to FormTemplate on initial render', () => {
    const observable = createObservableMock();
    const initialFieldContext = {
      args: {color: 'red'},
      fields: {name: 'john'},
    };

    let _a;
    let _b;

    const FormTemplate = ({a, b}) => {
      _a = a;
      _b = b;
      return null;
    };

    const formTemplateProps = ({args, fields}) => ({
      a: fields.name,
      b: {theme: {color: args.color}},
    });

    render(
      <FormTemplateProxy
        formTemplate={FormTemplate}
        formTemplateProps={formTemplateProps}
      />,
      wrapWithFormContext({initialFieldContext, observable})
    );

    expect(_a).toEqual('john');
    expect(_b).toEqual({theme: {color: 'red'}});
  });

  it('should pass props to FormTemplate on observable next', () => {
    let subject = null;
    const observable = {subscribe: observer => (subject = observer)};
    const initialFieldContext = {
      args: {color: 'red'},
      fields: {name: 'john'},
    };

    let _a;
    let _b;

    const FormTemplate = ({a, b}) => {
      _a = a;
      _b = b;
      return null;
    };

    const formTemplateProps = ({args, fields}) => ({
      a: fields.name,
      b: {theme: {color: args.color}},
    });

    render(
      <FormTemplateProxy
        formTemplate={FormTemplate}
        formTemplateProps={formTemplateProps}
      />,
      wrapWithFormContext({initialFieldContext, observable})
    );

    act(() => {
      subject.next({
        args: {color: 'green'},
        formState: {fields: {name: 'John'}},
      });
    });

    expect(_a).toEqual('John');
    expect(_b).toEqual({theme: {color: 'green'}});
  });
});
