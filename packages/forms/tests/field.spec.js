import React from 'react';
import Field from '../src/field';
import {KProvider} from '@k-frame/core';
import {render, queryByAttribute, cleanup} from 'react-testing-library';
//import renderer from 'react-test-renderer';
import 'jest-dom/extend-expect';
import {createStoreMock} from './testData';

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
    const {asFragment} = render(
      <Field
        id="name"
        component={Text}
        title="Name"
        fieldTemplate={FieldTemplate}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('should use defaultValue', () => {
    const {asFragment} = render(
      <Field
        id="name"
        component={Text}
        title="Name"
        defaultValue="John"
        fieldTemplate={FieldTemplate}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('should use formName for id', () => {
    const {container} = render(
      <Field
        id="name"
        formName="user"
        component={Text}
        title="Name"
        defaultValue="John"
        fieldTemplate={FieldTemplate}
      />
    );

    expect(getById(container, 'user-name').value).toBe('John');
  });

  it('should use format', () => {
    const formatCurrency = v => `$${v}`;

    const {container} = render(
      <Field
        id="name"
        component={Text}
        title="Name"
        format={formatCurrency}
        defaultValue="10"
        fieldTemplate={FieldTemplate}
      />
    );

    expect(getById(container, 'name').value).toBe('$10');
  });

  describe('onChange', () => {
    it('triggers when input changes', () => {
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
        />
      );

      triggerOnChange('john');
      triggerOnChange({target: {value: 'John'}});

      expect(handleOnChange).toHaveBeenCalledTimes(2);
      expect(handleOnChange).toHaveBeenNthCalledWith(1, 'john', 'name');
      expect(handleOnChange).toHaveBeenNthCalledWith(2, 'John', 'name');
    });

    it('uses parse', () => {
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
        />
      );

      triggerOnChange('134');

      expect(handleOnChange).toHaveBeenCalledTimes(1);
      expect(handleOnChange).toHaveBeenCalledWith(134, 'name');
    });
  });

  describe('connects to KContext', () => {
    it('should use value from KContext on initial render', () => {
      const store = createStoreMock();
      store.getState.mockReturnValue({fields: {name: 'John'}});

      const {container} = render(
        <KProvider store={store}>
          <Field
            id="name"
            component={Text}
            title="Name"
            fieldTemplate={FieldTemplate}
          />
        </KProvider>
      );

      expect(store.getState).toHaveBeenCalledTimes(1);
      expect(getById(container, 'name').value).toBe('John');
    });

    it('should ignore defaultValue when KContext has override', () => {
      const store = createStoreMock();
      store.getState.mockReturnValue({fields: {name: 'John'}});

      const {container} = render(
        <KProvider store={store}>
          <Field
            id="name"
            component={Text}
            title="Name"
            defaultValue="Maria"
            fieldTemplate={FieldTemplate}
          />
        </KProvider>
      );

      expect(store.getState).toHaveBeenCalledTimes(1);
      expect(getById(container, 'name').value).toBe('John');
    });

    it('should use defaultValue when KContext value is not defined', () => {
      const store = createStoreMock();
      store.getState.mockReturnValue({fields: {age: 30}});

      const {container} = render(
        <KProvider store={store}>
          <Field
            id="name"
            component={Text}
            title="Name"
            defaultValue="John"
            fieldTemplate={FieldTemplate}
          />
        </KProvider>
      );

      expect(store.getState).toHaveBeenCalledTimes(1);
      expect(getById(container, 'name').value).toBe('John');
    });

    it('should update when KContext value changes', () => {
      let subject = null;
      const store = createStoreMock();
      store.subscribe.mockImplementation(s => (subject = s));
      store.getState.mockReturnValueOnce({fields: {name: 'Joh'}});
      store.getState.mockReturnValue({fields: {name: 'John'}});

      const {container} = render(
        <KProvider store={store}>
          <Field
            id="name"
            component={Text}
            title="Name"
            defaultValue="John"
            fieldTemplate={FieldTemplate}
          />
        </KProvider>
      );

      expect(store.subscribe).toHaveBeenCalledTimes(1);
      expect(getById(container, 'name').value).toBe('Joh');
      subject();
      expect(getById(container, 'name').value).toBe('John');
      subject();
      expect(getById(container, 'name').value).toBe('John');
      expect(store.getState).toHaveBeenCalledTimes(4);
    });
  });
  describe('props', () => {
    it('should pass props to the input', () => {
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
          defaultValue="10"
          fieldTemplate={FieldTemplate}
          props={{propA: 'Foo', propB: 'Bar'}}
        />
      );

      expect(getByTestId('propA').innerHTML).toBe('Foo');
      expect(getByTestId('propB').innerHTML).toBe('Bar');
    });
  });
});
