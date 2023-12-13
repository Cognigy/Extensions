/* eslint-disable @typescript-eslint/no-non-null-assertion */
import addToStorage from '../../../utils/addToStorage';
import findChildNode from '../../../utils/findChildNode';
import fetchCaseData from '../api/fetchCaseData';
import { onFoundCase, onNotFoundCase } from '../getCase';
import type { IGetCaseParams } from '../types';
import mapSearchParamsToXml from '../../../utils/mapSearchParamsToXml';

const getCaseNodeResolver = async({ cognigy, config, childConfigs }: IGetCaseParams): Promise<void> => {
  const { api } = cognigy;
  const { connection, storeLocation, contextKey, inputKey } = config;
  const { apiKey, tenantId, baseUrl } = connection;

  const onNotFoundCaseChild = findChildNode(childConfigs, onNotFoundCase);
  const onFoundCaseChild = findChildNode(childConfigs, onFoundCase);

  try {
    const filterXml = mapSearchParamsToXml(config);
    if (!filterXml) {
      api.log!('error', 'No search parameters provided');
      api.setNextNode!(onNotFoundCaseChild!.id);
      return;
    }
    api.log!('info', 'Fetching customer data with filterXml = ' + filterXml);
    const foundCases = await fetchCaseData({ filterXml, apiKey, baseUrl, tenantId });
    if (foundCases.length > 0) {
      api.setNextNode!(onFoundCaseChild!.id);

      addToStorage({
        api,
        storeLocation,
        contextKey,
        inputKey,
        data: foundCases[0]
      });
    } else {
      api.setNextNode!(onNotFoundCaseChild!.id);
    }
  } catch (error) {
    api.log!('error', error.message);
    api.setNextNode!(onNotFoundCaseChild!.id);
  }
};

export default getCaseNodeResolver;
