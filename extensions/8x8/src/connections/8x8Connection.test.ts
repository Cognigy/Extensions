import { connection } from './8x8Connection';

describe('8x8Connection', () => {
  it('should match snapshot', () => {
    expect(connection).toMatchSnapshot();
  });
});
