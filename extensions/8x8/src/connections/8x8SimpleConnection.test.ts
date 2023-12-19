import { simpleConnection } from './8x8SimpleConnection';

describe('8x8SimpleConnection', () => {
  it('should match snapshot', () => {
    expect(simpleConnection).toMatchSnapshot();
  });
});
