import {
  createNodeDescriptor,
  INodeFunctionBaseParams,
} from '@cognigy/extension-tools/build';
import t from '../translations';
import { convertDuration } from "../helpers/util";


export interface IInactivityTimerParams extends INodeFunctionBaseParams {
  config: {
    enable: boolean;
    timeout: number;
  };
}

export const inactivityTimerNode = createNodeDescriptor({
  type: 'timer',
  defaultLabel: t.timer.nodeLabel,
  summary: t.timer.nodeSummary,
  appearance: {
    color: 'green',
  },
  tags: ['service'],
  fields: [
    {
      type: 'toggle',
      key: 'enable',
      label: t.timer.enableTimerLabel,
      description: t.timer.enableTimerDescription,
      defaultValue: true,
      params: {
        required: true,
      },
    },
    {
      type: 'number',
      key: 'timeout',
      label: t.timer.useStartInputsLabel,
      params: {
        min: 2,
        max: 20,
      },
      defaultValue: 10,
      condition: {
        key: 'enable',
        value: true,
      },
    },
  ],
  preview: {
    key: 'timeout',
    type: 'text',
  },
  sections: [
    {
      key: 'general',
      fields: ['enable', 'timeout'],
      label: t.forward.sectionGeneralLabel,
      defaultCollapsed: false,
    },
  ],
  form: [
    {
      key: 'general',
      type: 'section',
    },
  ],
  function: async ({ cognigy, config }: IInactivityTimerParams) => {
    const { api } = cognigy;

    let payload: object;
    if (config.enable) {
      const timeout = convertDuration(config.timeout);
      if (!timeout) {
        api.log("error", "a timeout must be set to a positive number of seconds when starting the inactivity detection!");
        return;
      }
      payload = {
        status: 'inactivity-start',
        timeout: timeout,
      };
      api.say('', payload);
    } else {
      payload = {
        status: 'inactivity-stop',
      };
    }
    api.say('', payload);
  },
});
