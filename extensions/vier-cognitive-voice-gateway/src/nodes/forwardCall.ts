import {
  createNodeDescriptor,
  INodeFunctionBaseParams,
} from '@cognigy/extension-tools/build';
import {
  normalizeData,
  normalizeSipHeaders,
  convertWhisperText,
  normalizeText,
  convertDuration,
  delay,
} from '../helpers/util';
import t from '../translations';
import {
  transferCallFields,
  transferCallForm,
  TransferCallInputs,
  transferCallSections,
} from "../common/transferCall";

interface IForwardCallInputs extends TransferCallInputs {
  destinationNumber: string;
}

export interface IForwardCallParams extends INodeFunctionBaseParams {
  config: IForwardCallInputs;
}

export const forwardCallNode = createNodeDescriptor({
  type: 'forward',
  defaultLabel: t.forward.nodeLabel,
  summary: t.forward.nodeSummary,
  appearance: {
    color: 'blue',
  },

  tags: ['service'],
  fields: [
    {
      type: 'cognigyText',
      key: 'destinationNumber',
      label: t.forward.inputDestinationNumberLabel,
      description: t.forward.inputDestinationNumberDescription,
      params: {
        required: true,
      },
    },
    ...transferCallFields,
  ],

  preview: {
    key: 'destinationNumber',
    type: 'text',
  },

  sections: [
    {
      key: 'general',
      fields: ['destinationNumber'],
      label: t.forward.sectionGeneralLabel,
      defaultCollapsed: false,
    },
    ...transferCallSections,
  ],
  form: [
    {
      key: 'general',
      type: 'section',
    },
    ...transferCallForm,
  ],

  function: async ({ cognigy, config }: IForwardCallParams) => {
    const { api } = cognigy;

    const payload = {
      status: 'forward',
      destinationNumber: normalizeText(config.destinationNumber),
      callerId: normalizeText(config.callerId),
      customSipHeaders: normalizeSipHeaders(config.customSipHeaders),
      ringTimeout: convertDuration(config.ringTimeout),
      acceptAnsweringMachines: config.acceptAnsweringMachines,
      data: normalizeData(api, config.data),
      whispering: convertWhisperText(config.whisperingText),
      experimentalEnableRingingTone: config.experimentalEnableRingingTone,
    };

    return delay(100, () => {
      api.say('', payload);
      if (config.endFlow) {
        api.stopExecution();
      }
    });
  },
});
