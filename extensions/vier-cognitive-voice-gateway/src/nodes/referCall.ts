import { INodeFunctionBaseParams, createNodeDescriptor } from "@cognigy/extension-tools";
import t from '../translations';
import {
  normalizeSipHeaders,
  normalizeText,
  normalizeUserToUserInformation,
} from "../helpers/util";
import { EndFlowInputs, endFlowField } from "../common/shared";
import {
  customSipHeadersField,
  userToUserField,
} from "../common/transferCall";

interface IReferCallInputs extends EndFlowInputs {
  destination: string;
  userToUserInformation?: Array<string>
  customSipHeaders?: object;
}

export interface IReferCallParams extends INodeFunctionBaseParams {
  config: IReferCallInputs;
}

export const referCallNode = createNodeDescriptor({
  type: 'refer',
  defaultLabel: t.refer.nodeLabel,
  summary: t.refer.nodeSummary,
  appearance: {
    color: 'green',
  },
  tags: ['service'],
  behavior: {
    entrypoint: true,
  },
  fields: [
    {
      type: 'cognigyText',
      key: 'destination',
      label: t.shared.inputDestinationLabel,
      description: t.shared.inputDestinationDescription,
      params: {
        required: true,
        placeholder: '+E.164 number or SIP URI',
      },
    },
    userToUserField,
    customSipHeadersField,
    endFlowField,
  ],
  preview: {
    key: 'destination',
    type: 'text',
  },
  function: async ({ cognigy, config }: IReferCallParams) => {
    const { api } = cognigy;

    const payload = {
      status: 'refer',
      destination: normalizeText(config.destination),
      customSipHeaders: normalizeSipHeaders(config.customSipHeaders),
      userToUserInformation: normalizeUserToUserInformation(config.userToUserInformation),
    };

    api.say('', payload);
    if (config.endFlow) {
      api.stopExecution();
    }
  },
});
