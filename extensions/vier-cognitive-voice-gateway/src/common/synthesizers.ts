import { INodeField, INodeFieldAndSectionFormElement } from "@cognigy/extension-tools/build/interfaces/descriptor"
import { normalizeTextArray } from "../helpers/util"
import t from '../translations';

export interface SynthesizersInputs {
  synthesizers: Array<string>,
}

export interface SynthesizersInputsWithToggleToUseDefault extends SynthesizersInputs {
  changeSynthesizers: boolean,
}

export function synthesizersField(key: string): INodeField {
  return {
    type: 'textArray',
    key: key,
    label: t.shared.synthesizersLabel,
    description: t.shared.synthesizersDescription,
    params: {
      required: false,
    },
  }
}

export function synthesizersFieldWithToggleToUseDefault(): Array<INodeField> {
  return [
    {
      type: 'toggle',
      key: 'overwriteSynthesizers',
      label: t.shared.changeSynthesizersSwitchLabel,
      description: t.shared.changeSynthesizersSwitchDescription,
      defaultValue: false,
    },
    {
      ...synthesizersField('synthesizers'),
      condition: {
        key: 'overwriteSynthesizers',
        value: true,
      }
    }]
}

export const synthesizersForm: Array<INodeFieldAndSectionFormElement> = [
    {
      key: 'overwriteSynthesizers',
      type: 'field',
    },
    {
      key: 'synthesizers',
      type: 'field',
    },
]

export function convertSynthesiersRespectToggleToUseDefault(inputs: SynthesizersInputsWithToggleToUseDefault): Array<string> | null {
  return inputs.changeSynthesizers ? normalizeTextArray(inputs.synthesizers) : null
}

export const synthesizersWithToggleToUseDefaultFieldKeys: readonly string[] = synthesizersFieldWithToggleToUseDefault().map(field => field.key);
