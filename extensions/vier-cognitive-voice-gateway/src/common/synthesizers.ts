import { INodeField, INodeFieldTranslations, TNodeFieldCondition } from "@cognigy/extension-tools/build/interfaces/descriptor"
import t from '../translations';

export interface SynthesizersInputs {
  SynthesizerVendorSelectPrimary: string,
  SynthesizerVendorSelectFallback: string,
  SynthesizerProfileTokenPrimary: string,
  SynthesizerVoicePrimary: string,
  SynthesizerProfileTokenFallback: string,
  SynthesizerVoiceFallback: string,
}

export function synthesizersFields(extraCondition?: TNodeFieldCondition): INodeField[] {
  const makeVendorSelect = (key: string, label: INodeFieldTranslations, description: INodeFieldTranslations, required: boolean): INodeField => {
    const options: any[] = [
      { value: 'PROFILE_TOKEN', label: 'Profile Token' },
      { value: 'GOOGLE', label: 'Google' },
      { value: 'MICROSOFT', label: 'Microsoft' },
      { value: 'IBM', label: 'IBM' },
      { value: 'AMAZON', label: 'Amazon' },
      { value: 'NUANCE', label: 'Nuance' },
      { value: 'OPEN_AI', label: 'OpenAI (US-hosted)' },
    ]
    if (!required) {
      options.unshift({ value: '', label: '-' })
    }

    return {
      type: 'select',
      key: key,
      label: label,
      description: description,
      params: {
        required: required,
        options: options,
      },
      defaultValue: required ? 'PROFILE_TOKEN' : '',
      condition: extraCondition
    }
  }

  const vendorSelectPrimary: INodeField =
    makeVendorSelect('SynthesizerVendorSelectPrimary', t.textToSpeech.inputServiceLabel, t.textToSpeech.inputServiceDescription, true)

  const vendorSelectFallback: INodeField =
    makeVendorSelect('SynthesizerVendorSelectFallback', t.textToSpeech.inputServiceFallbackLabel, t.textToSpeech.inputServiceFallbackDescription, false)

  return [
    vendorSelectPrimary,
    {
      type: 'text',
      key: 'SynthesizerProfileTokenPrimary',
      label: t.textToSpeech.inputProfileTokenLabel,
      description: t.textToSpeech.inputProfileTokenDescription,
      params: { required: true },
      condition: {
        and: [extraCondition, { key: vendorSelectPrimary.key, value: 'PROFILE_TOKEN' }]
      }
    },
    {
      type: 'text',
      key: 'SynthesizerVoicePrimary',
      label: t.textToSpeech.inputVoiceLabel,
      description: t.textToSpeech.inputVoiceDescription,
      params: { required: true },
      condition: {
        and: [extraCondition, { key: vendorSelectPrimary.key, value: 'PROFILE_TOKEN', negate: true }]
      },
    },
    vendorSelectFallback,
    {
      type: 'text',
      key: 'SynthesizerProfileTokenFallback',
      label: t.textToSpeech.inputProfileTokenFallbackLabel,
      description: t.textToSpeech.inputProfileTokenFallbackDescription,
      params: { required: true },
      condition: {
        and: [extraCondition, { key: vendorSelectFallback.key, value: 'PROFILE_TOKEN' }]
      }
    },
    {
      type: 'text',
      key: 'SynthesizerVoiceFallback',
      label: t.textToSpeech.inputVoiceFallbackLabel,
      description: t.textToSpeech.inputVoiceFallbackDescription,
      params: { required: true },
      condition: {
        and: [extraCondition, { key: vendorSelectFallback.key, value: 'PROFILE_TOKEN', negate: true }, { key: vendorSelectFallback.key, value: '', negate: true }]
      },
    },
  ]
}

export const synthesizerFieldKeys: readonly string[] = synthesizersFields().map(field => field.key);

export function synthesizersFieldWithToggleToUseDefault(): Array<INodeField> {
  return [
    {
      type: 'toggle',
      key: 'changeSynthesizers',
      label: t.shared.changeSynthesizersSwitchLabel,
      defaultValue: false,
    },
    ...synthesizersFields({
      key: 'changeSynthesizers',
      value: true,
    })
  ]
}

function tryParseJson(text: string): any {
  try {
    return JSON.parse(text)
  } catch (_) {
    return text
  }
}

function convertVendorSelect(vendorSelectValue: string, profileTokenValue: string, voiceValue: string): any | undefined {
  if (vendorSelectValue === '') {
    return undefined
  }
  if (vendorSelectValue === 'PROFILE_TOKEN') {
    return tryParseJson(profileTokenValue)
  }
  return {
    vendor: vendorSelectValue,
    voice: voiceValue,
  }
}

export function convertSynthesizers(inputs: SynthesizersInputs): Array<any> {
  const primary = convertVendorSelect(inputs.SynthesizerVendorSelectPrimary, inputs.SynthesizerProfileTokenPrimary, inputs.SynthesizerVoicePrimary)
  const result = [primary]

  const fallback = convertVendorSelect(inputs.SynthesizerVendorSelectFallback, inputs.SynthesizerProfileTokenFallback, inputs.SynthesizerVoiceFallback)
  if (fallback !== undefined) {
    result.push(fallback)
  }

  return result
}

export interface SynthesizersInputsWithToggleToUseDefault extends SynthesizersInputs {
  changeSynthesizers: boolean,
}

export function convertSynthesizersIfChanged(inputs: SynthesizersInputsWithToggleToUseDefault): Array<any> | null {
  if (!inputs.changeSynthesizers) {
    return null
  }

  return convertSynthesizers(inputs)
}

export const synthesizersWithToggleToUseDefaultFieldKeys: readonly string[] = synthesizersFieldWithToggleToUseDefault().map(field => field.key);
