import asyncAction from '../src/asyncAction';
import {put, call} from 'redux-saga/effects';
import co from 'co';
jest.mock('redux-saga/effects');

beforeEach(() => {
  put.mockReset();
  put.mockImplementation(a => a);
  call.mockReset();
  call.mockImplementationOnce((fn, ...args) => fn(...args));
});

describe('asyncAction', () => {
  it('should return succeedded', () => {
    const fn = jest.fn((a, b) => Promise.resolve(a + b));

    const gen = asyncAction('test', fn, 1, 2);
    return co(gen).then(() => {
      expect(put).toHaveBeenCalledTimes(2);
      expect(put).toHaveBeenNthCalledWith(1, {type: 'async/test/request'});
      expect(put).toHaveBeenNthCalledWith(2, {
        type: 'async/test/succeeded',
        payload: 3,
      });
    });
  });

  it('should return failed', () => {
    const fn = jest.fn(() => Promise.reject('some error'));

    const gen = asyncAction('test', fn, 1, 2);
    return co(gen).then(
      () => {
        expect(put).toHaveBeenCalledTimes(2);
        expect(put).toHaveBeenNthCalledWith(1, {type: 'async/test/request'});
        expect(put).toHaveBeenNthCalledWith(2, {
          type: 'async/test/failed',
          payload: 'some error',
        });
      },
      e => {
        //TODO ensure call
        expect(e).toEqual('some error');
      }
    );
  });
});
