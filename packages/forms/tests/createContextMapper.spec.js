import createContextMapper from '../src/createContextMapper';

const indexedSchema = {
  name: {
    id: 'name',
    visible: () => true,
  },
};

const formState1 = {
  fields: {
    _id: '123',
    name: '',
  },
  formattedFields: {
    _id: '123',
    name: '',
  },
  errors: {
    _id: '',
    name: '',
  },
  touched: {
    name: false,
  },
  dirty: {
    name: false,
  },
};

describe('createContextMapper', () => {
  it('should map context with additional fields in state', () => {
    const fieldStatesRef = {current: null};
    const mapper = createContextMapper(
      indexedSchema,
      formState1,
      () => true,
      fieldStatesRef,
      {
        color: 'red',
      }
    );

    expect(
      mapper([
        {color: 'blue'},
        {...formState1, fields: {...formState1.fields, name: 'John'}},
      ])
    ).toEqual({
      args: {color: 'blue'},
      fieldsStates: {
        name: {
          error: '',
          errorVisible: true,
          formattedValue: '',
          id: 'name',
          value: 'John',
          visible: true,
          props: {},
        },
      },
      formState: {
        dirty: {
          name: false,
        },
        errors: {
          _id: '',
          name: ''
        },
        formattedFields: {
          _id: '123',
          name: '',
        },
        touched: {name: false},
        fields: {name: 'John', _id: '123'},
      },
    });

    expect(fieldStatesRef.current).toEqual({
      name: {
        error: '',
        errorVisible: true,
        formattedValue: '',
        id: 'name',
        props: {},
        value: 'John',
        visible: true,
      },
    });
  });
});
