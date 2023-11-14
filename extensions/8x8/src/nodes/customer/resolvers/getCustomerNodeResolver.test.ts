import type { I8x8SimpleConnection } from '../../../connections/8x8SimpleConnection';
import addToStorage from '../../../utils/addToStorage';
import fetchCustomerData from '../api/fetchCustomerData';
import { onFoundCustomer, onNotFoundCustomer } from '../getCustomer';
import type { IGetCustomerParams, SearchCustomerParams } from '../types';
import getCustomerNodeResolver from './getCustomerNodeResolver';

jest.mock('../../../utils/addToStorage', () => jest.fn());
jest.mock('../api/fetchCustomerData', () => jest.fn());

const mockFetch = fetchCustomerData as jest.Mock;
const mockAddStorage = addToStorage as jest.Mock;

describe('customer > getCustomerNodeResolver', () => {
  const mockOnFoundCustomerId = 'mockOnFoundCustomerId';
  const mockOnNotFoundCustomerId = 'mockOnNotFoundCustomerId';
  const getMockConfig = (filters: SearchCustomerParams): IGetCustomerParams => {
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
      apiKey: 'asdf32fsadf3d',
      clusterBaseUrl: '8x8.com'
    } as unknown as I8x8SimpleConnection;
    return {
      cognigy,
      config: {
        connection,
        storeLocation: 'context',
        contextKey: 'customer',
        ...filters
      },
      childConfigs: [
        { ...onFoundCustomer, id: mockOnFoundCustomerId },
        { ...onNotFoundCustomer, id: mockOnNotFoundCustomerId }
      ]
    } as unknown as IGetCustomerParams;
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should not find the customer with accountNum empty', async() => {
    mockFetch.mockReturnValue([]);
    const config = getMockConfig({
      filter$accountNum: '10000000'
    });
    await getCustomerNodeResolver(config);
    expect(config.cognigy.api.setNextNode).toHaveBeenCalledWith(mockOnNotFoundCustomerId);
  });

  it('should throw an error the fetch for customer', async() => {
    const mockError = new Error('mockError');
    mockFetch.mockRejectedValue(mockError);
    const config = getMockConfig({
      filter$accountNum: '10000000'
    });
    await getCustomerNodeResolver(config);
    expect(config.cognigy.api.setNextNode).toHaveBeenCalledWith(mockOnNotFoundCustomerId);
    expect(config.cognigy.api.log).toHaveBeenCalledWith('error', mockError.message);
  });

  it('should found the customer', async() => {
    const mockCustomer = {
      id: 'mockId',
      accountNumber: '10000000'
    };
    mockFetch.mockReturnValue([mockCustomer]);
    const config = getMockConfig({
      filter$accountNum: mockCustomer.accountNumber
    });
    await getCustomerNodeResolver(config);
    expect(config.cognigy.api.setNextNode).toHaveBeenCalledWith(mockOnFoundCustomerId);
    expect(mockAddStorage).toHaveBeenCalledWith({
      api: config.cognigy.api,
      data: mockCustomer,
      contextKey: 'customer',
      storeLocation: 'context'
    });
  });

  it('should throw an error if filters are empty', async() => {
    const config = getMockConfig({});
    await getCustomerNodeResolver(config);
    expect(config.cognigy.api.setNextNode).toHaveBeenCalledWith(mockOnNotFoundCustomerId);
    expect(config.cognigy.api.log).toHaveBeenCalledWith('error', 'No search parameters provided');
  });
});
