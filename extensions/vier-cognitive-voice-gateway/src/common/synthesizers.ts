import { INodeField } from "@cognigy/extension-tools/build/interfaces/descriptor"
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
      key: 'changeSynthesizers',
      label: t.shared.changeSynthesizersSwitchLabel,
      description: t.shared.changeSynthesizersSwitchDescription,
      defaultValue: false,
    },
    {
      ...synthesizersField('synthesizers'),
      condition: {
        key: 'changeSynthesizers',
        value: true,
      }
    }]
}

export function convertSynthesiersRespectToggleToUseDefault(inputs: SynthesizersInputsWithToggleToUseDefault): Array<string> | null {
  return inputs.changeSynthesizers ? normalizeTextArray(inputs.synthesizers) : null
}

export const synthesizersWithToggleToUseDefaultFieldKeys: readonly string[] = synthesizersFieldWithToggleToUseDefault().map(field => field.key);
