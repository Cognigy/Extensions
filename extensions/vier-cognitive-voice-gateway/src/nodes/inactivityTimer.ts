import { createNodeDescriptor, INodeFunctionBaseParams } from '@cognigy/extension-tools/build';
import t from '../translations';


export interface IInactivityTimerParams extends INodeFunctionBaseParams {
  config: {
    timeout: number;
    useStopInputs?: boolean;
  };
}

export const inactivityTimerNode = createNodeDescriptor({
  type: 'timer',
  defaultLabel: t.timer.nodeLabel,
  summary: t.timer.nodeSummary,
  appearance: {
    color: 'green'
  },
  
  fields: [

    {
      type: 'checkbox',
      key: 'useStopInputs',
      label: t.timer.useStopInputsLabel,
      description: t.timer.inputTimeoutStopDescription,
    },
    {
      type: 'number',
      key: 'timeout',
      label: t.timer.useStartInputsLabel,
      description: t.timer.inputTimeoutStartDescription,
      params: {
        min: 2,
        max: 20,
        required: true,
      }
      },
  ],

  sections: [
    {
      key: 'general',
      fields: [ 'useStopInputs','timeout' ],
      label: t.forward.sectionGeneralLabel,
      defaultCollapsed: false,
    }
  ],
  form: [
    {
      key: 'general',
      type: 'section',
    }
  ],
  function: async ({ cognigy, config }: IInactivityTimerParams) => {
    const { api } = cognigy;

      if (config.useStopInputs) {
        api.say('', {
          status: 'inactivity-stop',
        });
    }

    api.say('' , {
      status: 'inactivity-start',
      timeout: config.timeout * 1000,
    });
  }
});
