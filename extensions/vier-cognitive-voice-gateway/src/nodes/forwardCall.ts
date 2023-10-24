import {
  createNodeDescriptor,
  INodeFunctionBaseParams,
} from '@cognigy/extension-tools/build';
import {
  normalizeData,
  normalizeSipHeaders,
  convertWhisperText,
  normalizeText,
  convertDurationFromSecondsToMillis,
  delay,
  normalizeUserToUserInformation,
} from '../helpers/util';
import t from '../translations';
import {
  transferCallFields,
  transferCallForm,
  TransferCallInputs,
  transferCallSections,
} from "../common/transferCall";
import {
  generalSection,
  generalSectionFormElement,
} from "../common/shared";

interface IForwardCallInputs extends TransferCallInputs {
  destinationNumber: string;
}

export interface IForwardCallParams extends INodeFunctionBaseParams {
  config: IForwardCallInputs;
}

const destinationFieldKey: keyof IForwardCallInputs = 'destinationNumber'

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
      key: destinationFieldKey,
      label: t.shared.inputDestinationLabel,
      description: t.shared.inputDestinationDescription,
      params: {
        required: true,
      },
    },
    ...transferCallFields,
  ],

  preview: {
    key: destinationFieldKey,
    type: 'text',
  },

  sections: [
    generalSection([destinationFieldKey]),
    ...transferCallSections,
  ],
  form: [
    generalSectionFormElement,
    ...transferCallForm,
  ],

  function: async ({ cognigy, config }: IForwardCallParams) => {
    const { api } = cognigy;

    const payload = {
      status: 'forward',
      destinationNumber: normalizeText(config.destinationNumber),
      callerId: normalizeText(config.callerId),
      customSipHeaders: normalizeSipHeaders(config.customSipHeaders),
      userToUserInformation: normalizeUserToUserInformation(config.userToUserInformation),
      ringTimeout: convertDurationFromSecondsToMillis(config.ringTimeout),
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
