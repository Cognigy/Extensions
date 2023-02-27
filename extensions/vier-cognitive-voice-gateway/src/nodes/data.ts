import {
  createNodeDescriptor,
  INodeFunctionBaseParams,
} from '@cognigy/extension-tools/build';
import { normalizeData } from '../helpers/util';
import t from '../translations';

export interface ISendDataParams extends INodeFunctionBaseParams {
  config: {
    data: object
  };
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
    const payload = {
      status: 'data',
      data: normalizeData(api, config.data) ?? {},
    };
    api.say('', payload);
  },
});
