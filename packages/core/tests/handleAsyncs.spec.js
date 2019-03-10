import {handleAsyncs} from '../src/main';
import {initAction, someRandomAction} from './testData';
import {lensProp} from 'ramda';

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  console.error.mockRestore();
});

afterEach(() => {
  console.error.mockClear();
});

describe('handleAsyncs', () => {
  describe('init', () => {
    it('do not initializes state when model is not defined', () => {
      expect(handleAsyncs({})(undefined, initAction())).toEqual(undefined);
    });

    it('initializes state with simple model definition', () => {
      expect(handleAsyncs({users: {}})(undefined, initAction())).toEqual({
        data: {
          users: {
            pending: false,
            result: null,
            error: null,
          },
        },
      });
    });

    it('initializes state with default value definition', () => {
      expect(
        handleAsyncs({users: {defaultValue: 'John'}})(undefined, initAction())
      ).toEqual({
        data: {
          users: {
            pending: false,
            result: 'John',
            error: null,
          },
        },
      });
    });

    it('passes random action', () => {
      expect(
        handleAsyncs({user: {defaultValue: 'John'}})(
          {
            data: {
              user: {result: 'John', pending: false, error: null},
            },
          },
          someRandomAction()
        )
      ).toEqual({
        data: {
          user: {
            pending: false,
            result: 'John',
            error: null,
          },
        },
      });
    });

    it('handles request action', () => {
      expect(
        handleAsyncs({user: {defaultValue: ''}})(
          {
            data: {
              user: {result: '', pending: false, error: null},
            },
          },
          {type: 'async/user/request'}
        )
      ).toEqual({
        data: {
          user: {
            pending: true,
            result: '',
            error: null,
          },
        },
      });
    });

    it('handles succeeded action', () => {
      expect(
        handleAsyncs({user: {defaultValue: ''}})(
          {
            data: {
              user: {result: '', pending: false, error: null},
            },
          },
          {type: 'async/user/succeeded', payload: 'John'}
        )
      ).toEqual({
        data: {
          user: {
            pending: false,
            result: 'John',
            error: null,
          },
        },
      });
    });

    it('handles failed action', () => {
      expect(
        handleAsyncs({user: {defaultValue: ''}})(
          {
            data: {
              user: {result: 'some value', pending: false, error: null},
            },
          },
          {type: 'async/user/failed', payload: 'Error'}
        )
      ).toEqual({
        data: {
          user: {
            pending: false,
            result: 'some value',
            error: 'Error',
          },
        },
      });
    });

    it('uses custom lens', () => {
      const state = {
        data: {
          user: {pending: false, error: null},
        },
        user: '',
      };
      const newState = handleAsyncs({
        user: {defaultValue: '', resultLens: lensProp('user')},
      })(state, {
        type: 'async/user/succeeded',
        payload: 'John',
      });

      expect(newState).toEqual({
        data: {user: {error: null, pending: false}},
        user: 'John',
      });
    });

    it('logs error on unhandled actions', () => {
      const newState = handleAsyncs({user: {defaultValue: ''}})(
        {
          data: {
            user: {result: 'some value', pending: false, error: null},
          },
        },
        {type: 'async/thread/request'}
      );

      expect(console.error.mock.calls.length).toBe(1);
      expect(console.error.mock.calls[0][0]).toBe(
        'Async action has been dispatched without registering async handler. Please register a handler using handleAsyncs function.'
      );

      expect(newState).toEqual({
        data: {
          user: {
            pending: false,
            result: 'some value',
            error: null,
          },
        },
      });
    });

    it('passes old state on unknown stage', () => {
      const state = {
        data: {
          user: {result: 'some value', pending: false, error: null},
        },
      };
      const newState = handleAsyncs({user: {defaultValue: ''}})(state, {
        type: 'async/user/wrong-stage',
      });

      expect(newState).toEqual(state);
    });
  });
});
