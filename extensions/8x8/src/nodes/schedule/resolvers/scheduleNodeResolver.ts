/* eslint-disable @typescript-eslint/no-non-null-assertion */
import fetchScheduleData from '../api/fetchScheduleData';
import { ScheduleOption } from '../constants/ScheduleValuesConstants';
import addToStorage from '../../../utils/addToStorage';
import { getScheduleStringValue } from '../utils/getScheduleStringValue';
import type { IGetScheduleParams } from '../types';
import { onChoice1Node, onChoice2Node, onChoice3Node, onChoice4Node, onChoice5Node, onChoice6Node, onClosedNode, onOpenNode } from '../getSchedule';
import findChildNode from '../../../utils/findChildNode';

const scheduleNodeResolver = async({ cognigy, config, childConfigs }: IGetScheduleParams): Promise<void> => {
  const { api } = cognigy;
  const { connection, storeLocation, scheduleNameToID, contextKey, inputKey } = config;
  const { tenantId, apiKey, baseUrl } = connection;

  const onOpenSchedule = findChildNode(childConfigs, onOpenNode);
  const onClosedSchedule = findChildNode(childConfigs, onClosedNode);
  const onChoice1 = findChildNode(childConfigs, onChoice1Node);
  const onChoice2 = findChildNode(childConfigs, onChoice2Node);
  const onChoice3 = findChildNode(childConfigs, onChoice3Node);
  const onChoice4 = findChildNode(childConfigs, onChoice4Node);
  const onChoice5 = findChildNode(childConfigs, onChoice5Node);
  const onChoice6 = findChildNode(childConfigs, onChoice6Node);

  try {
    const result = await fetchScheduleData(apiKey, tenantId, baseUrl, scheduleNameToID);

    const schedule = result['schedule-status'].status;
    const scheduleOutput = getScheduleStringValue(schedule);
    switch (schedule) {
      case ScheduleOption.Open:
        api.setNextNode!(onOpenSchedule!.id);
        break;
      case ScheduleOption.Closed:
        api.setNextNode!(onClosedSchedule!.id);
        break;
      case ScheduleOption.Choice1:
        api.setNextNode!(onChoice1!.id);
        break;
      case ScheduleOption.Choice2:
        api.setNextNode!(onChoice2!.id);
        break;
      case ScheduleOption.Choice3:
        api.setNextNode!(onChoice3!.id);
        break;
      case ScheduleOption.Choice4:
        api.setNextNode!(onChoice4!.id);
        break;
      case ScheduleOption.Choice5:
        api.setNextNode!(onChoice5!.id);
        break;
      case ScheduleOption.Choice6:
        api.setNextNode!(onChoice6!.id);
        break;
      default:
        throw new Error('Schedule not found');
    }
    addToStorage({ api, data: scheduleOutput, storeLocation, contextKey, inputKey });
  } catch (error) {
    api.log!('Error', error.message);
    api.setNextNode!(onClosedSchedule!.id);
  }
};

export default scheduleNodeResolver;
