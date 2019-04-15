import {createUpdater} from '../src/updater';

const schema = [{id: 'name'}, {id: 'age', defaultValue: 20}];

const initialState = {
  defaultValues: {
    name: '',
    age: 20,
  },
  fields: {
    name: '',
    age: 20,
  },
  dirty: {
    name: false,
    age: false,
  },
  touched: {
    name: false,
    age: false,
  },
  submitRequested: false,
};

const state1 = {
  defaultValues: {
    name: '',
    age: 20,
  },
  fields: {
    name: 'John',
    age: 22,
  },
  dirty: {
    name: true,
    age: true,
  },
  touched: {
    name: true,
    age: true,
  },
  submitRequested: true,
};

describe('createReducer', () => {
  it('should return initial state', () => {
    expect(
      createUpdater(
        {
          text: () => null,
        },
        schema,
        true
      )(undefined, {type: 'random'})
    ).toEqual(initialState);
  });
  it('should handle setField action', () => {
    expect(
      createUpdater(
        {
          text: () => null,
        },
        schema,
        true
      )(initialState, {
        type: 'SetField',
        payload: {name: 'name', value: 'John'},
      })
    ).toEqual({
      ...initialState,
      fields: {...initialState.fields, name: 'John'},
      dirty: {...initialState.dirty, name: true},
    });
  });
  it('should handle setTouched action', () => {
    expect(
      createUpdater(
        {
          text: () => null,
        },
        schema,
        true
      )(initialState, {
        type: 'SetTouched',
        payload: 'name',
      })
    ).toEqual({
      ...initialState,
      touched: {...initialState.touched, name: true},
    });
  });
  it('should handle setSubmitRequested action', () => {
    expect(
      createUpdater(
        {
          text: () => null,
        },
        schema,
        true
      )(initialState, {
        type: 'SetSubmitRequested',
      })
    ).toEqual({
      ...initialState,
      submitRequested: true,
    });
  });
  it('should handle reset action', () => {
    expect(
      createUpdater(
        {
          text: () => null,
        },
        schema,
        true
      )(state1, {
        type: 'Reset',
        payload: {resetOnCancel: true},
      })
    ).toEqual(initialState);
  });
  describe('submit action', () => {
    it('should handle with reset', () => {
      expect(
        createUpdater(
          {
            text: () => null,
          },
          schema,
          true
        )(state1, {
          type: 'Submit',
          payload: {resetOnCancel: true},
        })
      ).toEqual(initialState);
    });
    it('should handle with persist', () => {
      expect(
        createUpdater(
          {
            text: () => null,
          },
          schema,
          false
        )(state1, {
          type: 'Submit',
          payload: {resetOnCancel: true},
        })
      ).toEqual({...initialState, fields: {name: 'John', age: 22}});
    });
  });
});
