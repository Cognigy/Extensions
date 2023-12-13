import type { I8x8SimpleConnection } from '../../../connections/8x8SimpleConnection';
import StoreLocationName from '../../../constants/StoreLocationName';
import addToStorage from '../../../utils/addToStorage';
import putCallToExternalIVR from '../api/putCallToExternalIVR';
import voiceHandoverNodeResolver from './voiceHandoverNodeResolver';

jest.mock('../../../utils/addToStorage', () => jest.fn());
jest.mock('../api/putCallToExternalIVR', () => jest.fn());

const mockPutCall = putCallToExternalIVR as jest.Mock;
const mockAddStorage = addToStorage as jest.Mock;

mockAddStorage.mockImplementation(() => ({}));

describe('voiceHandoverNodeResolver', () => {
  beforeEach(() => {
    mockAddStorage.mockReset();
    mockPutCall.mockReset();
  });

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
  const config = {
    connection,
    handoverInitiated: 'Handover initiated',
    sipCallId: 'sip-call-id',
    queueId: 'queue-id',
    storeLocation: StoreLocationName.Context,
    contextKey: 'putCallStatus',
    inputKey: 'putCallStatus',
    customFields: {
      user: {
        name: 'Roger Federer',
        userId: 'string',
        email: 'roger.federer@atp.com',
        phone: '+40744000111',
        company: 'Tennis',
        caseId: '1000',
        additionalProperties: [
          {
            key: 'firstName',
            value: 'Roger'
          }
        ]
      },
      assignment: {
        type: 'queue',
        id: 'queue-id'
      }
    } as unknown as JSON
  };
  const childConfigs = [
    { id: '', config, type: '' }
  ];
  const nodeId = '10';

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initiate handover, make API call, and store result in storage', async() => {
    const expectedApiCallParams = [
      config.connection.apiKey,
      config.connection.tenantId,
      config.connection.baseUrl,
      config.sipCallId,
      config.queueId,
      config.customFields
    ];

    const expectedPutCallResult = {
      status: 200
    };

    mockPutCall.mockResolvedValueOnce(expectedPutCallResult);

    await voiceHandoverNodeResolver({ cognigy, config, childConfigs, nodeId });

    expect(cognigy.api.say).toHaveBeenCalledWith(config.handoverInitiated);

    expect(putCallToExternalIVR).toHaveBeenCalledWith(...expectedApiCallParams);

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
    const expectedApiCallParams = [
      config.connection.apiKey,
      config.connection.tenantId,
      config.connection.baseUrl,
      config.sipCallId,
      config.queueId,
      config.customFields
    ];

    const expectedError = new Error('API call failed');

    mockPutCall.mockRejectedValueOnce(expectedError);

    await voiceHandoverNodeResolver({ cognigy, config, childConfigs, nodeId });

    expect(cognigy.api.say).toHaveBeenCalledWith(config.handoverInitiated);

    expect(putCallToExternalIVR).toHaveBeenCalledWith(...expectedApiCallParams);

    expect(mockAddStorage).not.toHaveBeenCalled();

    expect(cognigy.api.log).toHaveBeenCalledWith('error', expectedError.message);
  });
});
