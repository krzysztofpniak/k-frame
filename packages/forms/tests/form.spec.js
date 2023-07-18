import React from 'react';
import {Form} from '../src/main';
import {KProvider} from '@k-frame/core';
import {render, queryByAttribute, cleanup} from '@testing-library/react';
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

const schema1 = [{id: 'name', title: 'Name'}];

const schema2 = [{id: 'name', title: 'Name', defaultValue: 'John'}];

describe('Form', () => {
  it('logs error when schema not provided', () => {
    const store = createStoreMock();

    render(
      <KProvider store={store}>
        <Form scope="someScope" />
      </KProvider>
    );

    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Schema prop is required');
  });

  it('renders simplest Form', () => {
    const store = createStoreMock();

    const {container, asFragment} = render(
      <KProvider store={store}>
        <Form scope="someScope" schema={schema1} />
      </KProvider>
    );

    expect(asFragment()).toMatchSnapshot();
    expect(getById(container, 'name').value).toBe('');
  });

  it('uses defaultValue', () => {
    const store = createStoreMock();

    const {container, asFragment} = render(
      <KProvider store={store}>
        <Form scope="someScope" schema={schema2} />
      </KProvider>
    );

    expect(asFragment()).toMatchSnapshot();
    expect(getById(container, 'name').value).toBe('John');
  });

  it('sets focus to first field', () => {
    const store = createStoreMock();

    const {container} = render(
      <KProvider store={store}>
        <Form scope="someScope" schema={schema2} autoFocus />
      </KProvider>
    );

    expect(document.activeElement).toBe(getById(container, 'name'));
  });

  it('does not set focus', () => {
    const store = createStoreMock();

    const {container} = render(
      <KProvider store={store}>
        <Form scope="someScope" schema={schema2} />
      </KProvider>
    );

    expect(document.activeElement).toBe(document.body);
  });
});
