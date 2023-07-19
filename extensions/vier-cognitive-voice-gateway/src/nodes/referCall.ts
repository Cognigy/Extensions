import { INodeFunctionBaseParams, createNodeDescriptor } from "@cognigy/extension-tools";
import t from '../translations';
import { normalizeText } from "../helpers/util";
import { EndFlowInputs, endFlowField } from "../common/shared";

interface IReferCallInputs extends EndFlowInputs {
  destination: string;
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
      label: t.refer.inputDestinationLabel,
      description: t.refer.inputDestinationDescription,
      params: {
        required: true,
        placeholder: '+E.164 number or SIP URI',
      },
    },
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
    };

    api.say('', payload);
    if (config.endFlow) {
      api.stopExecution();
    }
  },
});
