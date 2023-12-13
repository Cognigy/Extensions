import axios from 'axios';
import type { PostDataAugmentationParams } from './postDataAugmentation';
import postDataAugmentation from './postDataAugmentation';

jest.mock('axios', () => jest.fn());
const mockAxios = axios as unknown as jest.Mock;

describe('api > fetchScheduleData()', () => {
  const mockParams: PostDataAugmentationParams = {
    apiKey: 'sdf23fqw-asdf-2q34f-q423-rarf',
    tenantId: 'mockTenant',
    baseUrl: 'https://8x8.com',
    sipCallId: 'sdfg34tgs34-dsfg34v-sdfg-34g-w45',
    requestBody: {
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
    }
  };

  const { apiKey, tenantId, baseUrl, sipCallId, requestBody } = mockParams;

  it('should make a PUT request to the external IVR API and return a successful response', async() => {
    mockAxios.mockResolvedValue({});

    await postDataAugmentation(apiKey, tenantId, baseUrl, sipCallId, requestBody);

    expect(mockAxios).toHaveBeenCalled();
  });
});

