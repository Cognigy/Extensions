import { createNodeDescriptor, INodeFunctionBaseParams } from '@cognigy/extension-tools/build';
import { t } from '../helpers/translations';

export interface ITerminateCallParams extends INodeFunctionBaseParams {
  config: {
    endFlow?: boolean
  };
}

export const terminateCallNode = createNodeDescriptor({
  type: 'terminate',
  defaultLabel: t('terminate.nodeLabel'),
  summary: t('terminate.nodeSummary'),
  tags: ['service'],
  appearance: {
    color: 'red',
  },
  fields: [
    {
      type: 'checkbox',
      key: 'endFlow',
      label: t('terminate.inputEndFlowLabel'),
      defaultValue: false,
      description: t('terminate.inputEndFlowDescription'),
    },
  ],
  sections: [
    {
      key: 'additional',
      label: t('forward.sectionAdditionalDataLabel'),
      fields: ['endFlow'],
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
    api.say('', {
      status: 'termination',
    });
    if (config.endFlow) {
      api.stopExecution();
    }
  }
});
