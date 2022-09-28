import { createNodeDescriptor, INodeFunctionBaseParams } from '@cognigy/extension-tools/build';
import { normalizeData } from '../helpers/bake';
import t from '../translations';

export interface ITerminateCallParams extends INodeFunctionBaseParams {
  config: {
    endFlow?: boolean,
    data: object,
  };
}

export const terminateCallNode = createNodeDescriptor({
  type: 'terminate',
  defaultLabel: t.terminate.nodeLabel,
  summary: t.terminate.nodeSummary,
  tags: ['service'],
  appearance: {
    color: 'red',
  },
  fields: [
    {
      type: 'checkbox',
      key: 'endFlow',
      label: t.shared.inputEndFlowLabel,
      defaultValue: false,
      description: t.shared.inputEndFlowDescription,
    },
    {
      type: 'json',
      key: 'data',
      label: t.shared.inputDataLabel,
      description: t.sendData.inputDataDescription,
      params: {
        required: false
      }
    }
  ],
  sections: [
    {
      key: 'additional',
      label: t.forward.sectionAdditionalDataLabel,
      fields: ['endFlow', 'data'],
      defaultCollapsed: true
    },
  ],
  form: [
    {
      key: 'additional',
      type: 'section',
    }
  ],
  function: async ({ cognigy, config }: ITerminateCallParams) => {
    const { api } = cognigy;
    const data = normalizeData(config.data);
    api.say('', {
      status: 'termination',
      data,
    });
    if (config.endFlow) {
      api.stopExecution();
    }
  }
});