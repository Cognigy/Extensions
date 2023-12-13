/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable max-lines-per-function */
import type { I8x8SimpleConnection } from '../../../connections/8x8SimpleConnection';
import StoreLocationName from '../../../constants/StoreLocationName';
import addToStorage from '../../../utils/addToStorage';
import type { DataAugmentationRequestBody } from '../api/postDataAugmentation';
import postDataAugmentation from '../api/postDataAugmentation';
import mapAugmentationFieldsToJSONRequestBody from '../../../utils/mapAugmentationFieldsToJSONRequestBody';
import dataAugmentationResolver from './dataAugmentationResolver';

jest.mock('../../../utils/addToStorage', () => jest.fn());
jest.mock('../api/postDataAugmentation', () => jest.fn());
jest.mock('../../../utils/mapAugmentationFieldsToJSONRequestBody', () => jest.fn());

const mockPutCall = postDataAugmentation as jest.Mock;
const mockAddStorage = addToStorage as jest.Mock;
const mockMapAugFields = mapAugmentationFieldsToJSONRequestBody as jest.Mock;

mockAddStorage.mockImplementation(() => ({}));

describe('dataAugmentationResolver', () => {
  beforeEach(() => {
    mockAddStorage.mockReset();
    mockPutCall.mockReset();
  });

  const requestBody = {
    data: {
      variables: [
        {
          name: 'mockName1',
          value: 'mock value 1',
          ivr: 'true',
          display: 'true',
          displayName: 'mock name to be displayed 1'
        },
        {
          name: 'mockName2',
          value: 'mock value 2',
          ivr: 'true',
          display: 'true',
          displayName: 'mock name to be displayed 2'
        }
      ]
    }
  } as unknown as DataAugmentationRequestBody;

  const cognigy = {
    api: { output: jest.fn(), setNextNode: jest.fn(), log: jest.fn(), say: jest.fn() },
    input: {},
    context: {},
    profile: {},
    addToContext: jest.fn(),
    addToInput: jest.fn()
  };
  const connection = {
    tenantId: 'vcc-eu3',
    apiKey: 'sdvfa423qrf-asdfg-s43-dfg-34-g-43re43rr2r',
    baseUrl: '8x8.com'
  } as unknown as I8x8SimpleConnection;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initiate data augmentation with payload from custom fields, make API call, and store result in storage', async() => {
    const config = {
      connection,
      sipCallId: 'sip-call-id',
      useCustomFields: true,
      customFields: requestBody,
      displayName1: 'displayName1',
      value1: 'value1',
      displayName2: 'displayName2',
      value2: 'value2',
      displayName3: 'displayName3',
      value3: 'value3',
      displayName4: 'displayName4',
      value4: 'value4',
      displayName5: 'displayName5',
      value5: 'value5',
      storeLocation: StoreLocationName.Context,
      contextKey: 'putCallStatus',
      inputKey: 'putCallStatus',
      requestBody
    };

    const childConfigs = [
      { id: '', config, type: '' }
    ];
    const nodeId = '10';

    const expectedApiCallParams = [
      config.connection.apiKey,
      config.connection.tenantId,
      config.connection.baseUrl,
      config.sipCallId,
      config.customFields
    ];

    const expectedPutCallResult = {
      status: 200
    };

    mockPutCall.mockResolvedValueOnce(expectedPutCallResult);

    await dataAugmentationResolver({ cognigy, config, childConfigs, nodeId });

    expect(postDataAugmentation).toHaveBeenCalledWith(...expectedApiCallParams);

    expect(mockMapAugFields).not.toHaveBeenCalled();

    expect(mockAddStorage).toHaveBeenCalledWith({
      api: cognigy.api,
      data: expectedPutCallResult.status,
      storeLocation: config.storeLocation,
      contextKey: config.contextKey,
      inputKey: config.inputKey
    });

    expect(cognigy.api.log).not.toHaveBeenCalled();
  });

  it('should initiate data augmentation with payload from manual inputs, make API call, and store result in storage', async() => {
    const config = {
      connection,
      sipCallId: 'sip-call-id',
      useCustomFields: false,
      customFields: requestBody,
      displayName1: 'displayName1',
      value1: 'value1',
      displayName2: 'displayName2',
      value2: 'value2',
      displayName3: 'displayName3',
      value3: 'value3',
      displayName4: 'displayName4',
      value4: 'value4',
      displayName5: 'displayName5',
      value5: 'value5',
      storeLocation: StoreLocationName.Context,
      contextKey: 'putCallStatus',
      inputKey: 'putCallStatus',
      requestBody
    };

    const childConfigs = [
      { id: '', config, type: '' }
    ];
    const nodeId = '10';

    const mappedRequestBody = {
      data: {
        variables: [
          {
            display: 'true',
            displayName: 'mock name to be displayed 1',
            ivr: 'true',
            name: 'mockName1',
            value: 'mock value 1'
          },
          {
            display: 'true',
            displayName: 'mock name to be displayed 2',
            ivr: 'true',
            name: 'mockName2',
            value: 'mock value 2'
          }
        ]
      }
    };

    const expectedApiCallParams = [
      config.connection.apiKey,
      config.connection.tenantId,
      config.connection.baseUrl,
      config.sipCallId,
      JSON.stringify(mappedRequestBody)
    ];

    const expectedPutCallResult = {
      status: 200
    };

    mockPutCall.mockResolvedValueOnce(expectedPutCallResult);

    mockMapAugFields.mockReturnValue(mappedRequestBody);

    await dataAugmentationResolver({ cognigy, config, childConfigs, nodeId });

    expect(postDataAugmentation).toHaveBeenCalledWith(...expectedApiCallParams);

    expect(mockMapAugFields).toHaveBeenCalledWith(config);

    expect(mockAddStorage).toHaveBeenCalledWith({
      api: cognigy.api,
      data: expectedPutCallResult.status,
      storeLocation: config.storeLocation,
      contextKey: config.contextKey,
      inputKey: config.inputKey
    });

    expect(cognigy.api.log).not.toHaveBeenCalled();
  });

  it('should log an error if the API call fails', async() => {
    const config = {
      connection,
      sipCallId: 'sip-call-id',
      useCustomFields: true,
      customFields: requestBody,
      displayName1: 'displayName1',
      value1: 'value1',
      displayName2: 'displayName2',
      value2: 'value2',
      displayName3: 'displayName3',
      value3: 'value3',
      displayName4: 'displayName4',
      value4: 'value4',
      displayName5: 'displayName5',
      value5: 'value5',
      storeLocation: StoreLocationName.Context,
      contextKey: 'putCallStatus',
      inputKey: 'putCallStatus',
      requestBody
    };

    const childConfigs = [
      { id: '', config, type: '' }
    ];
    const nodeId = '10';

    const expectedApiCallParams = [
      config.connection.apiKey,
      config.connection.tenantId,
      config.connection.baseUrl,
      config.sipCallId,
      config.requestBody
    ];

    const expectedError = new Error('API call failed');

    mockPutCall.mockRejectedValueOnce(expectedError);

    await dataAugmentationResolver({ cognigy, config, childConfigs, nodeId });

    expect(postDataAugmentation).toHaveBeenCalledWith(...expectedApiCallParams);

    expect(mockAddStorage).not.toHaveBeenCalled();

    expect(cognigy.api.log).toHaveBeenCalledWith('error', expectedError.message);
  });
});
