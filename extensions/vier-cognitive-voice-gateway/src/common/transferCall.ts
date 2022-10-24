import {
  INodeField,
  INodeFieldAndSectionFormElement,
  INodeSection,
} from "@cognigy/extension-tools/build/interfaces/descriptor";
import t from "../translations";
import {
  endFlowField,
  EndFlowInputs,
} from "./shared";

export interface TransferCallInputs extends EndFlowInputs {
  callerId?: string
  customSipHeaders?: object
  ringTimeout?: number
  acceptAnsweringMachines?: boolean
  data?: object
  experimentalEnableRingingTone?: boolean
  whisperingText?: string
}

const callerIdField: INodeField = {
  type: 'cognigyText',
  key: 'callerId',
  label: t.shared.inputCallerIdLabel,
  description: t.shared.inputCallerIdDescription,
  params: {
    placeholder: '+E.164 format, e.g. "+49721480848680"',
  },
};

const customSipHeadersField: INodeField = {
  type: 'json',
  key: 'customSipHeaders',
  label: t.shared.inputCustomSipHeadersLabel,
  description: t.shared.inputCustomSipHeadersDescription,
};

const ringTimeoutField: INodeField = {
  type: 'number',
  key: 'ringTimeout',
  label: t.shared.inputRingTimeoutLabel,
  description: t.shared.inputRingTimeoutDescription,
  defaultValue: 15,
  params: {
    placeholder: 'Value in Seconds, e.g. 60 for 1 minute',
    min: 10,
    max: 120,
  },
};

const acceptAnsweringMachinesField: INodeField = {
  type: 'toggle',
  key: 'acceptAnsweringMachines',
  label: t.shared.inputAcceptAnsweringMachinesLabel,
  description: t.shared.inputAcceptAnsweringMachinesDescription,
  defaultValue: false,
};

const dataField: INodeField = {
  type: 'json',
  key: 'data',
  label: t.shared.inputDataLabel,
  description: t.shared.inputDataDescription,
};

const enableRingingToneField: INodeField = {
  type: 'toggle',
  key: 'experimentalEnableRingingTone',
  label: t.shared.inputExperimentalEnableRingingToneLabel,
  description: t.shared.inputExperimentalEnableRingingToneDescription,
  defaultValue: false,
};

const whisperingTextField: INodeField = {
  type: 'cognigyText',
  key: 'whisperingText',
  label: t.shared.inputWhisperingTextLabel,
  description: t.shared.inputWhisperingTextDescription,
};

export const transferCallFields: Array<INodeField> = [
  callerIdField,
  customSipHeadersField,
  ringTimeoutField,
  acceptAnsweringMachinesField,
  dataField,
  endFlowField,
  enableRingingToneField,
  whisperingTextField,
];

const callSection: INodeSection = {
  key: 'call',
  fields: [callerIdField.key, ringTimeoutField.key, acceptAnsweringMachinesField.key],
  label: t.forward.sectionCallLabel,
  defaultCollapsed: true,
};

const sipHeadersSection: INodeSection = {
  key: 'sipHeaders',
  fields: [customSipHeadersField.key],
  label: t.shared.inputCustomSipHeadersLabel,
  defaultCollapsed: true,
};

const additionalDataSection: INodeSection = {
  key: 'additionalData',
  fields: [dataField.key],
  label: t.forward.sectionAdditionalDataLabel,
  defaultCollapsed: true,
};

const additionalSettingsSection: INodeSection = {
  key: 'additionalSettings',
  fields: [whisperingTextField.key, endFlowField.key, enableRingingToneField.key],
  label: t.forward.sectionAdditionalSettingsLabel,
  defaultCollapsed: true,
};

export const transferCallSections: Array<INodeSection> = [
  callSection,
  sipHeadersSection,
  additionalDataSection,
  additionalSettingsSection,
];

export const transferCallForm: Array<INodeFieldAndSectionFormElement> = [
  {
    key: callSection.key,
    type: 'section',
  },
  {
    key: sipHeadersSection.key,
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
];