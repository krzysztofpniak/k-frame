import createMultiScopeChannel from '../src/createMultiScopeChannel';
import {stdChannel} from 'redux-saga';
jest.mock('redux-saga');

beforeEach(() => {
  stdChannel.mockReset();
  stdChannel.mockReturnValue({
    put: jest.fn(),
  });
});

describe('createMultiScopeChannel', () => {
  it('should return test', () => {
    console.log('xx', stdChannel.mock.calls.length);
    const multiChannel = createMultiScopeChannel();
    multiChannel.getScopeChannel(['scopeA']);
    multiChannel.emit({type: 'scopeA.b'});
    console.log('xx', stdChannel.mock.calls.length);
    expect('test').toBe('test');
  });
});
