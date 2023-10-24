import {
  createNodeDescriptor,
  INodeFunctionBaseParams,
} from '@cognigy/extension-tools/build';
import { normalizeData } from '../helpers/util';
import t from '../translations';
import { INodeExecutionAPI } from "@cognigy/extension-tools/build/interfaces/descriptor";

export interface ISendDataParams extends INodeFunctionBaseParams {
  config: {
    data: object
  };
}

export function emitData(api: INodeExecutionAPI, data: object | undefined) {
  const normalizedData = normalizeData(api, data) ?? {};
  if (normalizedData) {
    const payload = {
      status: 'data',
      data: normalizedData,
    };
    api.say('', payload);
  }
}

export const sendDataNode = createNodeDescriptor({
  type: 'sendData',
  defaultLabel: t.sendData.nodeLabel,
  summary: t.sendData.nodeSummary,
  appearance: {
    color: '#9501c9',
  },
  tags: ['service'],
  fields: [
    {
      type: 'json',
      key: 'data',
      label: t.sendData.nodeLabel,
      description: t.sendData.inputDataDescription,
      params: {
        required: true,
      },
    },
  ],
  function: async ({ cognigy, config }: ISendDataParams) => {
    const { api } = cognigy;
    emitData(api, config.data);
  },
});
