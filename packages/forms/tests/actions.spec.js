import {setField} from '../src/actions';

describe('setField', () => {
  it('should return action with name, value and debounce', () => {
    expect(setField('age', 12, false)).toEqual({
      type: 'SetField',
      payload: {
        name: 'age',
        value: 12,
        debounce: false,
      },
    });
  });
});
