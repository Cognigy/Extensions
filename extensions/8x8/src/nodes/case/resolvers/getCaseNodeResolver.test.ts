import type { I8x8Connection } from '../../../connections/8x8Connection';
import type { IGetCaseParams, SearchCaseParams } from '../types';
import { onFoundCase, onNotFoundCase } from '../getCase';
import fetchCaseData from '../api/fetchCaseData';
import addToStorage from '../../../utils/addToStorage';
import getCaseNodeResolver from './getCaseNodeResolver';

jest.mock('../../../utils/addToStorage', () => jest.fn());
jest.mock('../api/fetchCaseData', () => jest.fn());

const mockFetch = fetchCaseData as jest.Mock;
const mockAddStorage = addToStorage as jest.Mock;

describe('case > getCaseNodeResolver', () => {
  const mockOnFoundCaseId = 'mockOnFoundCaseId';
  const mockOnNotFoundCaseId = 'mockOnNotFoundCaseId';
  const getMockConfig = (filters: SearchCaseParams): IGetCaseParams => {
    const cognigy = {
      api: {
        output: jest.fn(), setNextNode: jest.fn(), log: jest.fn()
      },
      addToContext: jest.fn(),
      addToInput: jest.fn(),
      context: {}
    };

    const connection = {
      tenantId: 'vcc-eu3',
      dataRequestToken: 'testtoken1234',
      clusterBaseUrl: '8x8.com'
    } as unknown as I8x8Connection;
    return {
      cognigy,
      config: {
        connection,
        storeLocation: 'context',
        contextKey: 'case',
        ...filters
      },
      childConfigs: [
        { ...onFoundCase, id: mockOnFoundCaseId },
        { ...onNotFoundCase, id: mockOnNotFoundCaseId }
      ]
    } as unknown as IGetCaseParams;
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should find the case', async() => {
    const mockCase = {
      caseNum: 123123123,
      subject: 'Subject1',
      description: 'Description1'
    };
    mockFetch.mockReturnValue([mockCase]);
    const config = getMockConfig({
      filter$caseNum: '123123123'
    });
    await getCaseNodeResolver(config);
    expect(config.cognigy.api.setNextNode).toHaveBeenCalledWith(mockOnFoundCaseId);
    expect(mockAddStorage).toHaveBeenCalledWith({
      api: config.cognigy.api,
      data: mockCase,
      contextKey: 'case',
      storeLocation: 'context'
    });
  });

  it('should not find the customer with email empty', async() => {
    mockFetch.mockReturnValue([]);
    const config = getMockConfig({
      filter$firstName: 'John'
    });
    await getCaseNodeResolver(config);
    expect(config.cognigy.api.setNextNode).toHaveBeenCalledWith(mockOnNotFoundCaseId);
  });

  it('should throw an error if filters are empty', async() => {
    const config = getMockConfig({});
    await getCaseNodeResolver(config);
    expect(config.cognigy.api.setNextNode).toHaveBeenCalledWith(mockOnNotFoundCaseId);
    expect(config.cognigy.api.log).toHaveBeenCalledWith('error', 'No search parameters provided');
  });

  it('should throw an error the fetch for customer', async() => {
    const mockError = new Error('mockError');
    mockFetch.mockRejectedValue(mockError);
    const config = getMockConfig({
      filter$email: 'r@8x8.com'
    });
    await getCaseNodeResolver(config);
    expect(config.cognigy.api.setNextNode).toHaveBeenCalledWith(mockOnNotFoundCaseId);
    expect(config.cognigy.api.log).toHaveBeenCalledWith('error', mockError.message);
  });
});
