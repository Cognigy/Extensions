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
  tags: ['service'],
  fields: [
    {
      type: 'select',
      key: 'selectTimer',
      label: t.timer.selectTimerLabel,
      params: {
        required: true,
        options: [
          { value: 'Activate Timeout', label: 'Activate Timeout' },
          { value: 'Deactivate Timeout', label: 'Deactivate Timeout' },
        ]
      }
      },
    {
      type: 'checkbox',
      key: 'useStopInputs',
      label: t.timer.useStopInputsLabel,
      description: t.timer.inputTimeoutStopDescription,
      condition: {
        key: 'selectTimer',
        value: 'Deactivate Timeout'
      }
    },
    {
      type: 'number',
      key: 'timeout',
      label: t.timer.useStartInputsLabel,
      params: {
        min: 2,
        max: 20,
      },
      condition: {
        key: 'selectTimer',
        value: 'Activate Timeout'
      }
      },
  ],
  preview: {
    key: 'selectTimer',
    type: 'text'
  },
  sections: [
    {
      key: 'general',
      fields: [ 'selectTimer', 'timeout', 'useStopInputs' ],
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
    } else {
      api.say('' , {
        status: 'inactivity-start',
        timeout: config.timeout * 1000,
      });
    }
  }
});