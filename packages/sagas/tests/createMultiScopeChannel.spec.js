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
    const multiChannel = createMultiScopeChannel();
    multiChannel.getScopeChannel(['scopeA']);
    multiChannel.emit({type: 'scopeA.b'});
    expect('test').toBe('test');
  });
});
