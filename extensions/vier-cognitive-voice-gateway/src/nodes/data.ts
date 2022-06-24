import { createNodeDescriptor, INodeFunctionBaseParams } from '@cognigy/extension-tools/build';
import { bakeData } from '../helpers/bake';

export interface ISendDataParams extends INodeFunctionBaseParams {
  config: {
    data: object
  };
}

export const sendDataNode = createNodeDescriptor({
  type: 'sendData',
  defaultLabel: 'Send Data',
  summary: 'Attach custom data to a dialog',
  appearance: {
    color: '#9501c9'
  },
  tags: ['service'],
  fields: [
    {
      type: 'json',
      key: 'data',
      label: 'Custom Data',
      description: 'This is an object that can have arbitrary properties. Each property is expected to have a string value',
      params: {
        required: true
      }
    }
  ],
  function: async ({ cognigy, config } : ISendDataParams) => {
    const { api } = cognigy;
    const data = bakeData(config.data);

    api.say('', {
      status: 'data',
      data,
    });
  },
});
