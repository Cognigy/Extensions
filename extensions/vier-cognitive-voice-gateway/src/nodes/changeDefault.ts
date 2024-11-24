import t from "../translations"
import {
    INodeField,
    INodeFieldTranslations,
} from "@cognigy/extension-tools/build/interfaces/descriptor"
import {
    bargeInFieldKeys,
    bargeInFields,
    BargeInInputs,
    BargeInOptions,
    convertBargeIn,
} from "../common/bargeIn"
import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools/build"
import { convertLanguageSelect, languageSelectField } from "../common/shared"
import {
    SynthesizersInputs,
    convertSynthesizers,
    synthesizerFieldKeys,
    synthesizersFields,
} from "../common/synthesizers"

export enum OverwriteStrategy {
    RESET_DEFAULT = "UseProjectValue",
    IGNORE = "LeaveUnchanged",
    USE_VALUE = "OverwriteWith",
}

export class Default<T> {
    value: T | null
    type: OverwriteStrategy

    constructor(value: T | null, strategyOnMissing: OverwriteStrategy) {
        this.value = value
        this.type = strategyOnMissing
    }
}

interface IChangeDefaultsPayload {
    status: string
    language: Default<string>
    synthesizers: Default<Array<string>>
    bargeInOptions: Default<BargeInOptions>
}

interface IChangeDefaultsInputs extends BargeInInputs, SynthesizersInputs {
    synthesizersOverwriteStrategy?: OverwriteStrategy
    ttsLanguageOverwriteStrategy?: OverwriteStrategy
    ttsLanguage?: string
    ttsBargeInOverwriteStrategy?: OverwriteStrategy
}

export interface IChangeDefaultsParams extends INodeFunctionBaseParams {
    config: IChangeDefaultsInputs
}

interface OverwriteStrategyFieldParams {
    key: string
    label: INodeFieldTranslations
    description: INodeFieldTranslations
    resetDefaultOption: INodeFieldTranslations | undefined
    useValueOption: INodeFieldTranslations | undefined
}

function overwriteStrategyField(params: OverwriteStrategyFieldParams): INodeField {
    const options = []
    const addOption = (strategy: OverwriteStrategy, label: INodeFieldTranslations | undefined) => {
        if (label !== undefined) {
            options.push({ value: strategy, label: label })
        }
    }
    addOption(OverwriteStrategy.IGNORE, t.changeDefaults.overwriteStrategy.doNotChangeOption)
    addOption(OverwriteStrategy.RESET_DEFAULT, params.resetDefaultOption)
    addOption(OverwriteStrategy.USE_VALUE, params.useValueOption)

    return {
        type: "select",
        key: params.key,
        label: params.label,
        description: params.description,
        defaultValue: OverwriteStrategy.IGNORE,
        params: {
            required: true,
            options: options,
        },
    }
}

export const changeDefaultsNode = createNodeDescriptor({
    type: "defaults",
    defaultLabel: t.changeDefaults.nodeLabel,
    summary: t.changeDefaults.nodeSummary,
    appearance: {
        color: "blue",
    },
    tags: ["service"],
    fields: [
        overwriteStrategyField({
            key: "synthesizersOverwriteStrategy",
            label: t.changeDefaults.synthesizersOverwriteStrategyLabel,
            description: t.changeDefaults.synthesizersOverwriteStrategyDescription,
            resetDefaultOption: t.changeDefaults.overwriteStrategy.resetOption,
            useValueOption: t.changeDefaults.overwriteStrategy.useValue.synthesizersOption,
        }),
        ...synthesizersFields({
            key: "synthesizersOverwriteStrategy",
            value: OverwriteStrategy.USE_VALUE,
        }),
        overwriteStrategyField({
            key: "ttsLanguageOverwriteStrategy",
            label: t.changeDefaults.ttsLanguageOverwriteStrategyLabel,
            description: t.changeDefaults.ttsLanguageOverwriteStrategyDescription,
            resetDefaultOption: t.changeDefaults.overwriteStrategy.resetOption,
            useValueOption: t.changeDefaults.overwriteStrategy.useValue.ttsLanguageOption,
        }),
        {
            ...languageSelectField(
                "ttsLanguage",
                true,
                t.changeDefaults.ttsLanguageLabel,
                t.changeDefaults.ttsLanguageDescription,
            ),
            condition: {
                key: "ttsLanguageOverwriteStrategy",
                value: OverwriteStrategy.USE_VALUE,
            },
        },

        overwriteStrategyField({
            key: "ttsBargeInOverwriteStrategy",
            label: t.changeDefaults.ttsBargeInOverwriteStrategyLabel,
            description: t.changeDefaults.ttsBargeInOverwriteStrategyDescription,
            resetDefaultOption: undefined,
            useValueOption: t.changeDefaults.overwriteStrategy.useValue.bargeInOption,
        }),
        ...bargeInFields({
            key: "ttsBargeInOverwriteStrategy",
            value: OverwriteStrategy.USE_VALUE,
        }),
    ],
    sections: [
        {
            key: "tts",
            fields: [
                "synthesizersOverwriteStrategy",
                ...synthesizerFieldKeys,
                "ttsLanguageOverwriteStrategy",
                "ttsLanguage",
                "ttsBargeInOverwriteStrategy",
                ...bargeInFieldKeys,
            ],
            label: t.changeDefaults.ttsSectionLabel,
            defaultCollapsed: false,
        },
    ],
    form: [
        {
            key: "tts",
            type: "section",
        },
    ],

    function: async ({ cognigy, config }: IChangeDefaultsParams) => {
        const { api } = cognigy

        const payload: IChangeDefaultsPayload = {
            status: "change-defaults",
            language: new Default<string>(
                convertLanguageSelect(config.ttsLanguage),
                config.ttsLanguageOverwriteStrategy,
            ),
            synthesizers: new Default<Array<string>>(
                convertSynthesizers(config),
                config.synthesizersOverwriteStrategy,
            ),
            bargeInOptions: new Default<BargeInOptions>(
                convertBargeIn(api, config),
                config.ttsBargeInOverwriteStrategy,
            ),
        }
        api.say("", payload)
    },
})
