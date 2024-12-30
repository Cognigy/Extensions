import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools/build"
import {
    INodeField,
    INodeFieldTranslations,
    TNodeFieldCondition,
} from "@cognigy/extension-tools/build/interfaces/descriptor"
import t from "../translations"
import { convertLanguageSelect, languageSelectField } from "../common/shared"
import {
    getStringListFromContext,
    normalizedBoolean,
    normalizeText,
    normalizeTextArray,
} from "../helpers/util"

interface ITranscriptionSwitchInputs {
    language?: string
    transcriber: string
    profileToken?: string
    transcriberFallback?: string
    profileTokenFallback?: string
    boostedPhrases?: Array<string>
    boostedPhrasesFromContext?: string
    profanityFilter?: boolean
}

export interface ITranscriptionSwitchParams extends INodeFunctionBaseParams {
    config: ITranscriptionSwitchInputs
}

const vendorsWithBoostAndProfanitySupport = ["MICROSOFT", "GOOGLE", "IBM"]

function generateTranscriberSelect(
    key: string,
    label: INodeFieldTranslations,
    description: INodeFieldTranslations,
    condition: TNodeFieldCondition,
): INodeField {
    return {
        type: "select",
        key,
        label,
        description,
        params: {
            required: false,
            options: [
                { value: "", label: "Profile Token" },
                { value: "MICROSOFT", label: "Microsoft" },
                { value: "GOOGLE", label: "Google" },
                { value: "IBM", label: "IBM" },
                { value: "EML", label: "EML" },
                { value: "OPEN_AI", label: "OpenAI Whisper (US-hosted)" },
            ],
        },
        condition,
    }
}

function generateProfileTokenInput(
    key: string,
    label: INodeFieldTranslations,
    description: INodeFieldTranslations,
    condition: TNodeFieldCondition,
): INodeField {
    return {
        type: "text",
        key,
        label,
        description,
        params: {
            required: false,
            placeholder: "",
        },
        condition,
    }
}

const transcriberField = generateTranscriberSelect(
    "transcriber",
    t.speechToText.inputServiceLabel,
    t.speechToText.inputTranscriberDescription,
    {
        key: "profileToken",
        value: "",
    },
)

const profileTokenField = generateProfileTokenInput(
    "profileToken",
    t.speechToText.inputProfileTokenLabel,
    t.speechToText.inputProfileTokenDescription,
    {
        key: "transcriber",
        value: "",
    },
)

const transcriberFallbackField = generateTranscriberSelect(
    "transcriberFallback",
    t.speechToText.inputServiceFallbackLabel,
    t.speechToText.inputTranscriberDescription,
    {
        key: "profileTokenFallback",
        value: "",
    },
)

const profileTokenFallbackField = generateProfileTokenInput(
    "profileTokenFallback",
    t.speechToText.inputProfileTokenFallbackLabel,
    t.speechToText.inputProfileTokenFallbackDescription,
    {
        key: "transcriberFallback",
        value: "",
    },
)

function supportsAdvancedSettings(
    transcriber: INodeField,
    profileToken: INodeField,
): TNodeFieldCondition {
    return {
        and: [
            {
                or: vendorsWithBoostAndProfanitySupport.map(v => ({
                    key: transcriber.key,
                    value: v,
                })),
            },
            {
                key: profileToken.key,
                value: "",
            },
        ],
    }
}

function shouldDisplayAdvancedSetting(): TNodeFieldCondition {
    return {
        or: [
            supportsAdvancedSettings(transcriberField, profileTokenField),
            supportsAdvancedSettings(transcriberFallbackField, profileTokenFallbackField),
        ],
    }
}

const boostedPhrasesField: INodeField = {
    type: "textArray",
    key: "boostedPhrases",
    label: t.speechToText.inputBoostedPhrasesLabel,
    description: t.speechToText.inputBoostedPhrasesDescription,
    params: {
        required: false,
    },
    condition: shouldDisplayAdvancedSetting(),
}

const boostedPhrasesFromContextField: INodeField = {
    type: "text",
    key: "boostedPhrasesFromContext",
    label: t.speechToText.inputBoostedPhrasesFromContextLabel,
    description: t.speechToText.inputBoostedPhrasesFromContextDescription,
    params: {
        required: false,
    },
    condition: shouldDisplayAdvancedSetting(),
}

const profanityFilterField: INodeField = {
    type: "toggle",
    key: "profanityFilter",
    defaultValue: true,
    label: t.speechToText.inputProfanityFilterLabel,
    description: t.speechToText.inputProfanityFilterDescription,
    params: {
        required: false,
    },
    condition: shouldDisplayAdvancedSetting(),
}

type StaticTranscriber = string
interface DynamicTranscriber {
    vendor: string
    boostedPhrases?: Array<string>
    filterProfanity?: boolean
}
type Transcriber = StaticTranscriber | DynamicTranscriber

function createTranscriber(
    vendor: string,
    boostedPhrases: Set<string>,
    filterProfanity: boolean,
): Transcriber {
    if (boostedPhrases.size === 0 && filterProfanity === profanityFilterField.defaultValue) {
        return vendor
    }
    return {
        vendor,
        boostedPhrases: [...boostedPhrases],
        filterProfanity: filterProfanity,
    }
}

export const transcriptionSwitchNode = createNodeDescriptor({
    type: "speechToText",
    defaultLabel: t.speechToText.nodeLabel,
    summary: t.speechToText.nodeSummary,
    appearance: {
        color: "blue",
    },
    tags: ["service"],
    fields: [
        languageSelectField("language", true, t.speechToText.inputLanguageLabel),
        transcriberField,
        profileTokenField,
        transcriberFallbackField,
        profileTokenFallbackField,
        boostedPhrasesField,
        boostedPhrasesFromContextField,
        profanityFilterField,
    ],
    sections: [
        {
            key: "selectMainSTT",
            fields: [transcriberField.key, profileTokenField.key],
            label: t.speechToText.sectionSelectSTTLabel,
            defaultCollapsed: false,
        },
        {
            key: "selectFallbackSTT",
            fields: [transcriberFallbackField.key, profileTokenFallbackField.key],
            label: t.speechToText.sectionFallback,
            defaultCollapsed: true,
            condition: {
                or: [
                    {
                        key: transcriberField.key,
                        value: "",
                        negate: true,
                    },
                    {
                        key: profileTokenField.key,
                        value: "",
                        negate: true,
                    },
                    {
                        key: transcriberFallbackField.key,
                        value: "",
                        negate: true,
                    },
                    {
                        key: profileTokenFallbackField.key,
                        value: "",
                        negate: true,
                    },
                ],
            },
        },
        {
            key: "dynamicProfileSettings",
            fields: [
                boostedPhrasesField.key,
                boostedPhrasesFromContextField.key,
                profanityFilterField.key,
            ],
            label: t.speechToText.sectionDynamicProfileSettings,
            defaultCollapsed: false,
            condition: shouldDisplayAdvancedSetting(),
        },
    ],
    preview: {
        key: "transcriber",
        type: "text",
    },
    form: [
        {
            key: "language",
            type: "field",
        },
        {
            key: "selectMainSTT",
            type: "section",
        },
        {
            key: "selectFallbackSTT",
            type: "section",
        },
        {
            key: "dynamicProfileSettings",
            type: "section",
        },
    ],
    function: async ({ cognigy, config }: ITranscriptionSwitchParams) => {
        const { api } = cognigy
        const boostedPhrases = new Set(normalizeTextArray(config.boostedPhrases) ?? [])
        const boostedPhrasesContextKey = normalizeText(config.boostedPhrasesFromContext)
        if (boostedPhrasesContextKey) {
            getStringListFromContext(api, boostedPhrasesContextKey).forEach(s =>
                boostedPhrases.add(s),
            )
        }
        const profanityFilter: boolean = normalizedBoolean(profanityFilterField, config)

        const transcriber: Array<Transcriber> = []

        if (config.profileToken) {
            transcriber.push(config.profileToken)
        } else if (config.transcriber) {
            transcriber.push(createTranscriber(config.transcriber, boostedPhrases, profanityFilter))
        }

        if (config.profileTokenFallback) {
            transcriber.push(config.profileTokenFallback)
        } else if (config.transcriberFallback) {
            transcriber.push(
                createTranscriber(config.transcriberFallback, boostedPhrases, profanityFilter),
            )
        }

        const payload = {
            status: "transcription-switch",
            language: convertLanguageSelect(config.language),
            transcribers: transcriber.length ? transcriber : null,
        }
        api.say("", payload)
    },
})
