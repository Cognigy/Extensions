import t from '../translations';
import {
  INodeField,
  INodeFieldTranslations,
} from "@cognigy/extension-tools/build/interfaces/descriptor";
import {
  bargeInFieldKeys,
  bargeInFields,
  BargeInInputs,
  BargeInOptions,
  convertBargeIn,
} from "../common/bargeIn";
import {
  createNodeDescriptor,
  INodeFunctionBaseParams,
} from "@cognigy/extension-tools/build";
import {
  convertLanguageSelect,
  languageSelectField,
} from "../common/shared";
import { convertSynthesizers, synthesizersField } from '../common/synthesizers';

export enum OverwriteStrategy {
  RESET_DEFAULT = "UseProjectValue",
  IGNORE = "LeaveUnchanged",
  USE_VALUE = "OverwriteWith",
}

export class Default<T> {
  value: T | null;
  type: OverwriteStrategy;

  constructor(value: T | null, strategyOnMissing: OverwriteStrategy) {
    this.value = value;
    this.type = strategyOnMissing;
  }
}

interface IChangeDefaultsPayload {
  status: string,
  language: Default<string>,
  synthesizers: Default<Array<string>>,
  bargeInOptions: Default<BargeInOptions>,
}

interface IChangeDefaultsInputs extends BargeInInputs {
  synthesizersOverwriteStrategy?: OverwriteStrategy,
  defaultSynthesizers?: Array<string>,
  ttsLanguageOverwriteStrategy?: OverwriteStrategy,
  ttsLanguage?: string,
  ttsBargeInOverwriteStrategy?: OverwriteStrategy,
}

export interface IChangeDefaultsParams extends INodeFunctionBaseParams {
  config: IChangeDefaultsInputs;
}

export function overwriteStrategyField(key: string, label: INodeFieldTranslations, description: INodeFieldTranslations): INodeField {
  return {
    type: 'select',
    key: key,
    label: label,
    description: description,
    defaultValue: OverwriteStrategy.IGNORE,
    params: {
      required: true,
      options: [
        { value: OverwriteStrategy.IGNORE, label: t.changeDefaults.overwriteStrategy.doNotChange },
        { value: OverwriteStrategy.RESET_DEFAULT, label: t.changeDefaults.overwriteStrategy.reset },
        { value: OverwriteStrategy.USE_VALUE, label: t.changeDefaults.overwriteStrategy.useValue },
      ],
    },
  }
}

export const changeDefaultsNode = createNodeDescriptor({
  type: 'defaults',
  defaultLabel: t.changeDefaults.nodeLabel,
  summary: t.changeDefaults.nodeSummary,
  appearance: {
    color: 'blue',
  },
  tags: ['service'],
  fields: [
    overwriteStrategyField('synthesizersOverwriteStrategy', t.changeDefaults.synthesizersOverwriteStrategyLabel, t.changeDefaults.synthesizersOverwriteStrategyDescription),
    {
      ...synthesizersField('defaultSynthesizers'),
      condition: {
        key: 'synthesizersOverwriteStrategy',
        value: OverwriteStrategy.USE_VALUE,
      }
    },

    overwriteStrategyField('ttsLanguageOverwriteStrategy', t.changeDefaults.ttsLanguageLabel, t.changeDefaults.ttsLanguageDescription),
    {
      ...languageSelectField('ttsLanguage', true, t.changeDefaults.ttsLanguageLabel, t.changeDefaults.ttsLanguageDescription),
      condition: {
        key: 'ttsLanguageOverwriteStrategy',
        value: OverwriteStrategy.USE_VALUE,
      }
    },


    overwriteStrategyField('ttsBargeInOverwriteStrategy', t.changeDefaults.ttsBargeInOverwriteStrategyLabel, t.changeDefaults.ttsBargeInOverwriteStrategyDescription),
    ...bargeInFields({
      key: 'ttsBargeInOverwriteStrategy',
      value: OverwriteStrategy.USE_VALUE,
    }),
  ],
  sections: [
    {
      key: 'tts',
      fields: [
        'synthesizersOverwriteStrategy', 'defaultSynthesizers',
        'ttsLanguageOverwriteStrategy', 'ttsLanguage',
        'ttsBargeInOverwriteStrategy', ...bargeInFieldKeys,
      ],
      label: t.changeDefaults.ttsSectionLabel,
      defaultCollapsed: false,
    },
  ],
  form: [
    {
      key: 'tts',
      type: 'section',
    },
  ],

  function: async ({ cognigy, config }: IChangeDefaultsParams) => {
    const { api } = cognigy;

    let synthesizers = config.defaultSynthesizers
    if (!synthesizers) {
      synthesizers = []
    }

    const payload : IChangeDefaultsPayload = {
      status: 'change-defaults',
      language: new Default<string>(convertLanguageSelect(config.ttsLanguage), config.ttsLanguageOverwriteStrategy),
      synthesizers: new Default<Array<string>>(convertSynthesizers(synthesizers), config.synthesizersOverwriteStrategy),
      bargeInOptions: new Default<BargeInOptions>(convertBargeIn(api, config), config.ttsBargeInOverwriteStrategy),
    };
    api.say('', payload);
  },
});
