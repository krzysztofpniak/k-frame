import {handleAsyncs} from '../src/main';
import {initAction, someRandomAction} from './testData';
import {lensProp} from 'ramda';
import {AsyncState} from '../src/asyncState';

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

    it('uses custom object lens', () => {
      const state = {
        data: {
          user: {pending: false, error: null},
        },
        userName: '',
        lastName: '',
      };
      const newState = handleAsyncs({
        user: {
          defaultValue: '',
          resultLens: {
            name: lensProp('userName'),
            surname: lensProp('lastName'),
          },
        },
      })(state, {
        type: 'async/user/succeeded',
        payload: {name: 'John', surname: 'Brown'},
      });

      expect(newState).toEqual({
        data: {user: {error: null, pending: false}},
        userName: 'John',
        lastName: 'Brown',
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
        'Async action has been dispatched without registering async handler. Please register a handler for %cthread%c resource using handleAsyncs function.'
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

  describe('mode=adt', () => {
    it('initializes state with simple model definition', () => {
      expect(
        handleAsyncs({users: {mode: 'adt'}})(undefined, initAction())
      ).toEqual({
        data: {
          users: AsyncState.Created,
        },
      });
    });

    it('handles request action', () => {
      expect(
        handleAsyncs({user: {mode: 'adt'}})(
          {
            data: {
              user: AsyncState.Created,
            },
          },
          {type: 'async/user/request'}
        )
      ).toFLEqual({
        data: {
          user: AsyncState.Running({}),
        },
      });
    });

    it('handles succeeded action', () => {
      expect(
        handleAsyncs({user: {mode: 'adt'}})(
          {
            data: {
              user: AsyncState.Running({started: 10}),
            },
          },
          {
            type: 'async/user/succeeded',
            payload: {name: 'John', surname: 'Brown'},
          }
        )
      ).toFLEqual({
        data: {
          user: AsyncState.Completed({name: 'John', surname: 'Brown'}, {}),
        },
      });
    });

    it('handles failed action', () => {
      expect(
        handleAsyncs({user: {mode: 'adt'}})(
          {
            data: {
              user: AsyncState.Running({started: 10}),
            },
          },
          {
            type: 'async/user/failed',
            payload: {message: 'reason'},
          }
        )
      ).toFLEqual({
        data: {
          user: AsyncState.Faulted({message: 'reason'}, {}),
        },
      });
    });
  });
});
