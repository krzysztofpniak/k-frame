import {createAction} from '../src/main';

describe('createAction', () => {
  it('simple payload', () => {
    const action = createAction('actionName');

    const actionResult = action('some argument');

    expect(actionResult).toEqual({
      type: 'actionName',
      payload: 'some argument',
    });
  });

  it('complex payload', () => {
    const action = createAction('actionName', (a, b) => ({a, b}));

    const actionResult = action('foo', 'bar');

    expect(actionResult).toEqual({
      type: 'actionName',
      payload: {
        a: 'foo',
        b: 'bar',
      },
    });
  });
});
