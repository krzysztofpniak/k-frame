import useFormReducer from '../src/useFormReducer';
import {renderHook} from 'react-hooks-testing-library';
import {wrapWithKContext, createStoreMock} from './testData';

const fieldTypes = {
  text: () => null,
};

const getSchemaMock = () => [
  {id: 'name'},
  {id: 'surname'},
  {id: 'favColor', defaultValue: 'green'},
  {id: 'age', defaultValue: 22, visible: jest.fn(a => false)},
  {
    id: 'language',
    validate: jest.fn(() => 'This field is required'),
    props: jest.fn(({fields: {age}, args: {languages}}) => ({
      options: languages,
      age,
    })),
  },
];

let store = null;

const initStore = () => {
  store = createStoreMock();
};

beforeEach(() => {
  initStore();
});

describe('useFormReducer', () => {
  describe('formContext', () => {
    describe('getFieldState', () => {
      it('should throw for unknown field id', () => {
        const schema = getSchemaMock();
        const {result} = renderHook(
          () =>
            useFormReducer({
              fieldTypes,
              schema,
              errorsDisplayStrategy: () => false,
              args: {},
              resetOnSubmit: true,
            }),
          wrapWithKContext('scope1', store)
        );

        expect(() =>
          result.current.formContext.getFieldState('random')
        ).toThrow('Unknown field name: random');

        expect(() => result.current.formContext.getFieldState()).toThrow(
          'Unknown field name: '
        );
      });

      it('should return initial state', () => {
        const schema = getSchemaMock();
        const {result} = renderHook(
          () =>
            useFormReducer({
              fieldTypes,
              schema,
              errorsDisplayStrategy: () => false,
              args: {
                languages: ['en', 'de'],
              },
              resetOnSubmit: true,
            }),
          wrapWithKContext('scope1', store)
        );

        expect(result.current.formContext.getFieldState('name')).toEqual({
          id: 'name',
          value: '',
          props: {},
          error: '',
          errorVisible: false,
          visible: true,
        });

        expect(result.current.formContext.getFieldState('favColor')).toEqual({
          id: 'favColor',
          value: 'green',
          props: {},
          error: '',
          errorVisible: false,
          visible: true,
        });

        expect(result.current.formContext.getFieldState('age')).toEqual({
          id: 'age',
          value: 22,
          props: {},
          error: '',
          errorVisible: false,
          visible: false,
        });

        expect(result.current.formContext.getFieldState('language')).toEqual({
          id: 'language',
          value: '',
          props: {options: ['en', 'de'], age: 22},
          error: 'This field is required',
          errorVisible: false,
          visible: true,
        });
      });
    });
  });
});
