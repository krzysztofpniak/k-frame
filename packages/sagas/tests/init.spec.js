import {KProvider} from '../';
import {mount} from 'enzyme';
import jest from 'jest';

describe('init', () => {
  it('should return test', () => {
    jest.mockComponent();
    const hopla = mount(<KProvider store={{}}>a</KProvider>);

    expect(withScope()).toBe('test');
  });
});
