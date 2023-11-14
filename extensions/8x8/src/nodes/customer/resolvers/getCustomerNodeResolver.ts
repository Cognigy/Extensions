/* eslint-disable @typescript-eslint/no-non-null-assertion */
import addToStorage from '../../../utils/addToStorage';
import findChildNode from '../../../utils/findChildNode';
import fetchCustomersData from '../api/fetchCustomerData';
import { onFoundCustomer, onNotFoundCustomer } from '../getCustomer';
import type { IGetCustomerParams } from '../types';
import mapSearchParamsToXml from '../../../utils/mapSearchParamsToXml';

const getCustomerNodeResolver = async({ cognigy, config, childConfigs }: IGetCustomerParams): Promise<void> => {
  const { api } = cognigy;
  const { connection, storeLocation, contextKey, inputKey } = config;

  const { apiKey, tenantId, clusterBaseUrl } = connection;

  const onNotFoundCustomerChild = findChildNode(childConfigs, onNotFoundCustomer);
  const onFoundCustomerChild = findChildNode(childConfigs, onFoundCustomer);

  try {
    const filterXml = mapSearchParamsToXml(config);
    if (!filterXml) {
      api.log!('error', 'No search parameters provided');
      api.setNextNode!(onNotFoundCustomerChild!.id);
      return;
    }
    api.log!('info', 'Fetching customer data with filterXml = ' + filterXml);
    const foundCustomers = await fetchCustomersData({ filterXml, apiKey, clusterBaseUrl, tenantId });
    if (foundCustomers.length > 0) {
      api.setNextNode!(onFoundCustomerChild!.id);

      addToStorage({
        api,
        storeLocation,
        contextKey,
        inputKey,
        data: foundCustomers[0]
      });
    } else {
      api.setNextNode!(onNotFoundCustomerChild!.id);
    }
  } catch (error) {
    api.log!('error', error.message);
    api.setNextNode!(onNotFoundCustomerChild!.id);
  }
};

export default getCustomerNodeResolver;
