/* eslint-disable @typescript-eslint/no-non-null-assertion */
import findChildNode from '../../../utils/findChildNode';
import fetchQueueStatistics from '../api/fetchQueueStatistics';
import { onConditionMatchedNode, onConditionNotMatchedNode } from '../testConditionOfQueue';
import type { TestConditionOfQueueResolverParams } from '../types';
import checkConditions from './utils/checkConditions';

const testConditionOfQueueNodeResolver = async({ cognigy, config, childConfigs }: TestConditionOfQueueResolverParams): Promise<void> => {
  const { api } = cognigy;
  const { selectQueueId, connection } = config;
  const { apiKey, tenantId, clusterBaseUrl } = connection;
  const onConditionMatchedChild = findChildNode(childConfigs, onConditionMatchedNode);
  const onConditionNotMatchedChild = findChildNode(childConfigs, onConditionNotMatchedNode);

  try {
    if (!selectQueueId) {
      throw new Error('No queue ID selected');
    }
    api.log!('debug', `Fetching queue statistics for queue id ${selectQueueId}`);
    const queueStatisticsData = await fetchQueueStatistics({
      apiKey,
      clusterBaseUrl,
      tenantId,
      queueId: selectQueueId
    });
    if (!queueStatisticsData) {
      throw new Error(`No queue statistics data found for queue id ${selectQueueId}`);
    }
    api.log!('debug', `Queue statistics for queue id ${selectQueueId} = ${JSON.stringify(queueStatisticsData)}`);
    const conditionMatched = checkConditions(config, queueStatisticsData);

    if (conditionMatched) {
      api.setNextNode!(onConditionMatchedChild!.id);
    } else {
      api.setNextNode!(onConditionNotMatchedChild!.id);
    }
  } catch (error) {
    api.log!('error', error.message);
    api.setNextNode!(onConditionNotMatchedChild!.id);
  }
};

export default testConditionOfQueueNodeResolver;
