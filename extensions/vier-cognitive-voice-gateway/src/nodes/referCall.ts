import { INodeFunctionBaseParams, createNodeDescriptor } from "@cognigy/extension-tools";
import t from '../translations';
import {
  normalizeSipHeaders,
  normalizeText,
  normalizeUserToUserInformation,
} from "../helpers/util";
import {
  EndFlowInputs,
  endFlowField,
  generalSection,
  generalSectionFormElement,
} from "../common/shared";
import {
  additionalDataSection,
  additionalSettingsSection,
  customSipHeadersField,
  dataField,
  sipSection,
  userToUserField,
} from "../common/transferCall";
import { emitData } from "./data";

interface IReferCallInputs extends EndFlowInputs {
  destination: string;
  userToUserInformation?: Array<string>
  customSipHeaders?: object;
  data?: object;
}

export interface IReferCallParams extends INodeFunctionBaseParams {
  config: IReferCallInputs;
}

const destinationFieldKey: keyof IReferCallInputs = 'destination'

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
      key: destinationFieldKey,
      label: t.shared.inputDestinationLabel,
      description: t.shared.inputDestinationDescription,
      params: {
        required: true,
        placeholder: '+E.164 number or SIP URI',
      },
    },
    userToUserField,
    customSipHeadersField,
    dataField,
    endFlowField,
  ],
  preview: {
    key: 'destination',
    type: 'text',
  },
  sections: [
    generalSection([destinationFieldKey]),
    sipSection,
    additionalDataSection,
    additionalSettingsSection,
  ],
  form: [
    generalSectionFormElement,
    {
      key: sipSection.key,
      type: 'section',
    },
    {
      key: additionalDataSection.key,
      type: 'section',
    },
    {
      key: additionalSettingsSection.key,
      type: 'section',
    },
  ],
  function: async ({ cognigy, config }: IReferCallParams) => {
    const { api } = cognigy;

    const payload = {
      status: 'refer',
      destination: normalizeText(config.destination),
      customSipHeaders: normalizeSipHeaders(config.customSipHeaders),
      userToUserInformation: normalizeUserToUserInformation(config.userToUserInformation),
    };

    emitData(api, config.data);
    api.say('', payload);
    if (config.endFlow) {
      api.stopExecution();
    }
  },
});
