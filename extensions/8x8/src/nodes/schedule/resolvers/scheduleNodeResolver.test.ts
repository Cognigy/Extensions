import addToStorage from '../../../utils/addToStorage';
import type { I8x8Connection } from '../../../connections/8x8Connection';
import StoreLocationName from '../../../constants/StoreLocationName';
import fetchScheduleData from '../api/fetchScheduleData';
import scheduleNodeResolver from './scheduleNodeResolver';

jest.mock('../../../utils/addToStorage', () => jest.fn());
jest.mock('../api/fetchScheduleData', () => jest.fn());

const mockFetch = fetchScheduleData as jest.Mock;
const mockAddStorage = addToStorage as jest.Mock;

mockAddStorage.mockImplementation(() => ({}));

describe('scheduleNodeResolver', () => {
  beforeEach(() => {
    mockAddStorage.mockReset();
    mockFetch.mockReset();
  });

  const cognigy = { api: { output: jest.fn(), setNextNode: jest.fn(), log: jest.fn() }, input: {}, context: {}, profile: {}, addToContext: jest.fn(), addToInput: jest.fn() };
  const connection = {
    tenantId: 'vcc-eu3',
    dataRequestToken: 'testtoken1234',
    clusterBaseUrl: '8x8.com'
  } as unknown as I8x8Connection;
  const config = { connection, storeLocation: StoreLocationName.Context, scheduleNameToID: '1', contextKey: 'scheduletatus', inputKey: 'scheduleStatus' };
  const nodeId = '10';
  const childConfigs = [
    { id: '1', config, type: 'onOpenSchedule' },
    { id: '2', config, type: 'onClosedSchedule' },
    { id: '3', config, type: 'onChoice1' },
    { id: '4', config, type: 'onChoice2' },
    { id: '5', config, type: 'onChoice3' },
    { id: '6', config, type: 'onChoice4' },
    { id: '7', config, type: 'onChoice5' },
    { id: '8', config, type: 'onChoice6' }
  ];

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should set node onOpen successfully ', async() => {
    mockFetch.mockReturnValue({ 'schedule-status': { status: 0 } });
    await scheduleNodeResolver({ cognigy, config, childConfigs, nodeId });

    expect(cognigy.api.setNextNode).toHaveBeenCalledWith('1');
    expect(cognigy.api.setNextNode).toHaveBeenCalledTimes(1);
  });
  it('should set node onClosed successfully ', async() => {
    mockFetch.mockReturnValue({ 'schedule-status': { status: -1 } });
    await scheduleNodeResolver({ cognigy, config, childConfigs, nodeId });

    expect(cognigy.api.setNextNode).toHaveBeenCalledWith('2');
    expect(cognigy.api.setNextNode).toHaveBeenCalledTimes(1);
  });

  it('should set node onChoice1 successfully ', async() => {
    mockFetch.mockReturnValue({ 'schedule-status': { status: 'Choice #1' } });
    await scheduleNodeResolver({ cognigy, config, childConfigs, nodeId });

    expect(cognigy.api.setNextNode).toHaveBeenCalledWith('3');
    expect(cognigy.api.setNextNode).toHaveBeenCalledTimes(1);
  });
  it('should set node onChoice2 successfully ', async() => {
    mockFetch.mockReturnValue({ 'schedule-status': { status: 'Choice #2' } });
    await scheduleNodeResolver({ cognigy, config, childConfigs, nodeId });

    expect(cognigy.api.setNextNode).toHaveBeenCalledWith('4');
    expect(cognigy.api.setNextNode).toHaveBeenCalledTimes(1);
  });
  it('should set node onChoice3 successfully ', async() => {
    mockFetch.mockReturnValue({ 'schedule-status': { status: 'Choice #3' } });
    await scheduleNodeResolver({ cognigy, config, childConfigs, nodeId });

    expect(cognigy.api.setNextNode).toHaveBeenCalledWith('5');
    expect(cognigy.api.setNextNode).toHaveBeenCalledTimes(1);
  });
  it('should set node onChoice4 successfully ', async() => {
    mockFetch.mockReturnValue({ 'schedule-status': { status: 'Choice #4' } });
    await scheduleNodeResolver({ cognigy, config, childConfigs, nodeId });

    expect(cognigy.api.setNextNode).toHaveBeenCalledWith('6');
    expect(cognigy.api.setNextNode).toHaveBeenCalledTimes(1);
  });
  it('should set node onChoice5 successfully ', async() => {
    mockFetch.mockReturnValue({ 'schedule-status': { status: 'Choice #5' } });
    await scheduleNodeResolver({ cognigy, config, childConfigs, nodeId });

    expect(cognigy.api.setNextNode).toHaveBeenCalledWith('7');
    expect(cognigy.api.setNextNode).toHaveBeenCalledTimes(1);
  });
  it('should set node onChoice6 successfully ', async() => {
    mockFetch.mockReturnValue({ 'schedule-status': { status: 'Choice #6' } });
    await scheduleNodeResolver({ cognigy, config, childConfigs, nodeId });

    expect(cognigy.api.setNextNode).toHaveBeenCalledWith('8');
    expect(cognigy.api.setNextNode).toHaveBeenCalledTimes(1);
  });

  it('should trow an error ', async() => {
    const mockError = new Error('test error');
    mockFetch.mockRejectedValue(mockError);
    await scheduleNodeResolver({ cognigy, config, childConfigs, nodeId });

    expect(cognigy.api.setNextNode).toHaveBeenCalledWith('2');
    expect(cognigy.api.log).toHaveBeenCalledWith('Error', mockError.message);
  });

  it('should set node onClosed successfully when status don\'t match', async() => {
    mockFetch.mockReturnValue({ 'schedule-status': { status: 343432 } });
    await scheduleNodeResolver({ cognigy, config, childConfigs, nodeId });

    expect(cognigy.api.setNextNode).toHaveBeenCalledWith('2');
    expect(cognigy.api.log).toHaveBeenCalledTimes(1);
  });
});
