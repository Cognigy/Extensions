import { createNodeDescriptor, INodeFunctionBaseParams } from '@cognigy/extension-tools/build';

export interface ITerminateCallParams extends INodeFunctionBaseParams {
  config: {
    endFlow?: boolean
  };
}

export const terminateCallNode = createNodeDescriptor({
  type: 'terminate',
  defaultLabel: 'Terminate Call',
  summary: 'Drop the call',
  tags: ['service'],
  appearance: {
    color: 'red',
  },
  fields: [
    {
      type: 'checkbox',
      key: 'endFlow',
      label: 'Quit Flow',
      defaultValue: false,
      description: 'Stop the flow after executing this node'
    },
  ],
  sections: [
    {
      key: 'additional',
      label: 'Additional Settings',
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
