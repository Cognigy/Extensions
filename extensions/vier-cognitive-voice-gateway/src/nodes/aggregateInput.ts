import {
  createNodeDescriptor,
  INodeFunctionBaseParams,
} from '@cognigy/extension-tools/build';
import t from '../translations';
import { convertDurationFromSecondsToMillis } from "../helpers/util";

export interface IInactivityTimerParams extends INodeFunctionBaseParams {
  config: {
    enable: boolean;
    timeout: number;
  };
}

export const aggregateInputNode = createNodeDescriptor({
  type: 'aggregate-input',
  defaultLabel: t.aggregateInput.nodeLabel,
  summary: t.aggregateInput.nodeSummary,
  appearance: {
    color: 'green',
  },
  tags: ['service'],
  fields: [
    {
      type: 'toggle',
      key: 'enable',
      label: t.aggregateInput.enableFieldLabel,
      description: t.aggregateInput.enableFieldDescription,
      defaultValue: true,
      params: {
        required: true,
      },
    },
    {
      type: 'number',
      key: 'timeout',
      label: t.aggregateInput.timeoutFieldLabel,
      description: t.aggregateInput.timeoutFieldDescription,
      params: {
        min: 1,
        max: 15,
      },
      defaultValue: 3,
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
      const timeout = convertDurationFromSecondsToMillis(config.timeout);
      if (!timeout) {
        api.log("error", "a timeout must be set to a positive number of seconds when starting the inactivity detection!");
        return;
      }
      payload = {
        status: 'aggregation-start',
        timeout: timeout,
      };
    } else {
      payload = {
        status: 'aggregation-stop',
      };
    }
    api.say('', payload);
  },
});
