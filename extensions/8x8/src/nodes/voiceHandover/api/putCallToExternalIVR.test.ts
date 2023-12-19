import axios from 'axios';
import type { PutCallToExternalIVRParams } from './putCallToExternalIVR';
import putCallToExternalIVR from './putCallToExternalIVR';

jest.mock('axios', () => jest.fn());
const mockAxios = axios as unknown as jest.Mock;

describe('api > putCallToExternalIVR()', () => {
  const mockParams: PutCallToExternalIVRParams = {
    apiKey: 'sdf23fqw-asdf-2q34f-q423-rarf',
    tenantId: 'mockTenant',
    baseUrl: 'https://8x8.com',
    queueId: '1',
    sipCallId: 'sdfg34tgs34-dsfg34v-sdfg-34g-w45',
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
        id: '1'
      }
    }
  };

  const { apiKey, tenantId, baseUrl, queueId, sipCallId, customFields } = mockParams;

  it('should make a PUT request to the external IVR API and return a successful response', async() => {
    mockAxios.mockResolvedValue({});

    await putCallToExternalIVR(apiKey, tenantId, baseUrl, sipCallId, queueId, customFields);

    expect(mockAxios).toHaveBeenCalled();
  });
});

