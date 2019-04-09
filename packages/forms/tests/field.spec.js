import React from 'react';
import Field from '../src/field';
import {render, queryByAttribute, cleanup} from 'react-testing-library';
import 'jest-dom/extend-expect';
import {wrapWithFormContext, createObservableMock} from './testData';

afterEach(cleanup);

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  console.error.mockRestore();
});

afterEach(() => {
  console.error.mockClear();
});

const getById = queryByAttribute.bind(null, 'id');

const schema1 = {id: 'name', title: 'Name'};

const Text = ({id, value, onChange}) => (
  <input id={id} value={value} onChange={onChange} />
);

const FieldTemplate = ({input, title}) => (
  <div>
    <div>{title}</div>
    <div>{input}</div>
  </div>
);

describe('Field', () => {
  it('renders simplest field', () => {
    const getFieldState = jest.fn(() => ({
      id: 'name',
      value: '',
      visible: true,
    }));
    const observable = createObservableMock();
    const mountField = jest.fn(() => jest.fn());

    const {asFragment} = render(
      <Field
        id="name"
        component={Text}
        title="Name"
        fieldTemplate={FieldTemplate}
      />,
      wrapWithFormContext({getFieldState, observable, mountField})
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('should use formName for id', () => {
    const getFieldState = jest.fn(() => ({
      id: 'name',
      value: 'John',
      visible: true,
    }));
    const observable = createObservableMock();
    const mountField = jest.fn(() => jest.fn());

    const {container} = render(
      <Field
        id="name"
        formName="user"
        component={Text}
        title="Name"
        defaultValue="John"
        fieldTemplate={FieldTemplate}
      />,
      wrapWithFormContext({getFieldState, observable, mountField})
    );

    expect(getById(container, 'user-name').value).toBe('John');
  });

  it('should use format', () => {
    const getFieldState = jest.fn(() => ({
      id: 'name',
      value: 10,
      visible: true,
    }));
    const observable = createObservableMock();
    const mountField = jest.fn(() => jest.fn());
    const formatCurrency = v => `$${v}`;

    const {container} = render(
      <Field
        id="name"
        component={Text}
        title="Name"
        format={formatCurrency}
        defaultValue="10"
        fieldTemplate={FieldTemplate}
      />,
      wrapWithFormContext({getFieldState, observable, mountField})
    );

    expect(getById(container, 'name').value).toBe('$10');
  });

  describe('onChange', () => {
    it('triggers when input changes', () => {
      const getFieldState = jest.fn(() => ({
        id: 'name',
        value: 10,
        visible: true,
      }));
      const observable = createObservableMock();
      const mountField = jest.fn(() => jest.fn());
      let triggerOnChange = null;

      const TextWithOnChangeExposed = ({id, value, onChange}) => {
        triggerOnChange = onChange;
        return <input id={id} value={value} onChange={onChange} />;
      };

      const handleOnChange = jest.fn();

      render(
        <Field
          id="name"
          component={TextWithOnChangeExposed}
          title="Name"
          fieldTemplate={FieldTemplate}
          onChange={handleOnChange}
        />,
        wrapWithFormContext({getFieldState, observable, mountField})
      );

      triggerOnChange('john');
      triggerOnChange({target: {value: 'John'}});

      expect(handleOnChange).toHaveBeenCalledTimes(2);
      expect(handleOnChange).toHaveBeenNthCalledWith(1, 'john', 'name');
      expect(handleOnChange).toHaveBeenNthCalledWith(2, 'John', 'name');
    });

    it('uses parse', () => {
      const getFieldState = jest.fn(() => ({
        id: 'name',
        value: 10,
        visible: true,
      }));
      const observable = createObservableMock();
      const mountField = jest.fn(() => jest.fn());
      let triggerOnChange = null;

      const TextWithOnChangeExposed = ({id, value, onChange}) => {
        triggerOnChange = onChange;
        return <input id={id} value={value} onChange={onChange} />;
      };

      const handleOnChange = jest.fn();

      const parseIntNull = v => {
        const parsed = parseInt(v, 10);
        return isNaN(parsed) ? null : parsed;
      };

      render(
        <Field
          id="name"
          component={TextWithOnChangeExposed}
          title="Name"
          fieldTemplate={FieldTemplate}
          onChange={handleOnChange}
          parse={parseIntNull}
        />,
        wrapWithFormContext({getFieldState, observable, mountField})
      );

      triggerOnChange('134');

      expect(handleOnChange).toHaveBeenCalledTimes(1);
      expect(handleOnChange).toHaveBeenCalledWith(134, 'name');
    });
  });

  describe('connects to FormContext', () => {
    it('should update when FormContext value changes', () => {
      const f1 = {
        id: 'name',
        value: 'Joh',
        visible: true,
      };
      const f2 = {
        ...f1,
        value: 'John',
      };
      const getFieldState = jest.fn(() => f1);
      const subscribe = jest.fn();
      let subject = null;
      subscribe.mockImplementation(observer => {
        subject = observer;
        return jest.fn();
      });
      const observable = {subscribe};
      const mountField = jest.fn(() => jest.fn());

      const {container} = render(
        <Field
          id="name"
          component={Text}
          title="Name"
          defaultValue="John"
          fieldTemplate={FieldTemplate}
        />,
        wrapWithFormContext({getFieldState, observable, mountField})
      );

      expect(subscribe).toHaveBeenCalledTimes(1);
      expect(getById(container, 'name').value).toBe('Joh');
      subject.next({fieldsStates: {name: f2}});
      expect(getById(container, 'name').value).toBe('John');
      subject.next({fieldsStates: {name: f2}});
      expect(getById(container, 'name').value).toBe('John');
      expect(getFieldState).toHaveBeenCalledTimes(1);
    });
  });
  describe('props', () => {
    it('should pass props to the input', () => {
      const getFieldState = jest.fn(() => ({
        id: 'name',
        value: 'John',
        visible: true,
        props: {propA: 'Foo', propB: 'Bar'},
      }));
      const observable = createObservableMock();
      const mountField = jest.fn(() => jest.fn());
      const CustomComponent = ({id, value, onChange, propA, propB}) => (
        <div>
          <div data-testid="propA">{propA}</div>
          <div data-testid="propB">{propB}</div>
          <div>{propB}</div>
          <input id={id} value={value} onChange={onChange} />
        </div>
      );

      const {getByTestId} = render(
        <Field
          id="name"
          component={CustomComponent}
          title="Name"
          fieldTemplate={FieldTemplate}
        />,
        wrapWithFormContext({getFieldState, observable, mountField})
      );

      expect(getByTestId('propA').innerHTML).toBe('Foo');
      expect(getByTestId('propB').innerHTML).toBe('Bar');
    });
  });

  describe('visible', () => {
    it('should hide field', () => {
      const getFieldState = jest.fn(() => ({
        id: 'name',
        value: 'John',
        visible: false,
      }));
      const observable = createObservableMock();
      const mountField = jest.fn(() => jest.fn());

      const CustomComponent = jest.fn(() => <div>component</div>);

      const {asFragment} = render(
        <Field
          id="name"
          component={CustomComponent}
          title="Name"
          defaultValue="10"
          fieldTemplate={FieldTemplate}
        />,
        wrapWithFormContext({getFieldState, observable, mountField})
      );

      expect(asFragment()).toMatchSnapshot();
    });
  });
});
