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
      required: true,
    },
  }
}

export function synthesizersFieldWithToggleToUseDefault(): Array<INodeField> {
  return [
    {
      type: 'toggle',
      key: 'changeSynthesizers',
      label: t.shared.changeSynthesizersSwitchLabel,
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

export function convertSynthesizers(synthesizers: Array<string>): Array<any> {
  const result = new Array<any>()
  const normalizedArray = normalizeTextArray(synthesizers)
  if (!normalizedArray) {
    return result
  }
  for (var normalizedUserInput of normalizeTextArray(synthesizers) ) {
    try {
      result.push(JSON.parse(normalizedUserInput))
    } catch (_) {
      result.push(normalizedUserInput)
    }
  }
  return result
}

export function convertSynthesizersRespectToggleToUseDefault(inputs: SynthesizersInputsWithToggleToUseDefault): Array<any> | null {
  if (!inputs.changeSynthesizers) {
    return null
  }

  return convertSynthesizers(inputs.synthesizers)
}

export const synthesizersWithToggleToUseDefaultFieldKeys: readonly string[] = synthesizersFieldWithToggleToUseDefault().map(field => field.key);
