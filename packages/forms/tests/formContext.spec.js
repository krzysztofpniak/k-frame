import React, {useContext} from 'react';
import FormContext from '../src/FormContext';
import {render, cleanup} from '@testing-library/react';
import 'jest-dom/extend-expect';

afterEach(cleanup);

describe('FormContext', () => {
  it('default throws errors', () => {
    let context;
    const ContextConsumer = () => {
      context = useContext(FormContext);
      return null;
    };

    render(<ContextConsumer />);

    expect(() => context.getFieldState()).toThrow('FormContext not supplied');
    expect(() => context.observable.subscribe()).toThrow(
      'FormContext not supplied'
    );
    expect(() => context.mountField()).toThrow('FormContext not supplied');
  });
});
