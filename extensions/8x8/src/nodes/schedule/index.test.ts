import { getScheduleNodes } from './index';

describe('schedule > getSchedulesNode', () => {
  it('should create the nodes for schedule', () => {
    const nodes = getScheduleNodes();

    expect(nodes).toMatchSnapshot();
  });
});
