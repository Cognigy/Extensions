import { getScheduleStringValue } from './getScheduleStringValue';

describe('getScheduleStringValue', () => {
  it('should render Open', () => {
    expect(getScheduleStringValue(0)).toEqual('Open');
  });
  it('should render Closed', () => {
    expect(getScheduleStringValue(-1)).toEqual('Closed');
  });
  it('should render Choice #1', () => {
    expect(getScheduleStringValue('Choice #1')).toEqual('Choice #1');
  });
  it('should render Choice #2', () => {
    expect(getScheduleStringValue('Choice #2')).toEqual('Choice #2');
  });
  it('should render Choice #3', () => {
    expect(getScheduleStringValue('Choice #3')).toEqual('Choice #3');
  });
  it('should render Choice #4', () => {
    expect(getScheduleStringValue('Choice #4')).toEqual('Choice #4');
  });
  it('should render Choice #5', () => {
    expect(getScheduleStringValue('Choice #5')).toEqual('Choice #5');
  });
  it('should render Choice #6', () => {
    expect(getScheduleStringValue('Choice #6')).toEqual('Choice #6');
  });
});
