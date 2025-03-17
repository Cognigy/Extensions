import {
    INodeAppearance,
    INodeConstraints,
    INodeField,
    INodeFieldAndSectionFormElement,
    INodeFieldTranslations,
    INodeSection,
} from "@cognigy/extension-tools/build/interfaces/descriptor"
import t from "../translations"

/**
 * This list is sorted lexicographically, with 4 exceptions:
 *   1. en-US
 *   2. en-GB
 *   3. de-DE
 *   4. fr-FR
 * These have been moved to the start of the list as they are likely going to be the most used languages.
 *
 * TODO replace this by an option resolver
 */
export const supportedLanguages: readonly string[] = [
    "ar-EG",
    "ar-SA",
    "bg-BG",
    "bn-IN",
    "ca-ES",
    "cs-CZ",
    "da-DK",
    "de-AT",
    "de-CH",
    "de-DE",
    "el-GR",
    "en-AU",
    "en-GB",
    "en-IN",
    "en-US",
    "es-ES",
    "es-MX",
    "es-US",
    "et-EE",
    "fi-FI",
    "fil-PH",
    "fr-BE",
    "fr-CA",
    "fr-CH",
    "fr-FR",
    "gu-IN",
    "he-IL",
    "hi-IN",
    "hr-HR",
    "hu-HU",
    "id-ID",
    "is-IS",
    "it-IT",
    "ja-JP",
    "kn-IN",
    "ko-KR",
    "lt-LT",
    "lv-LV",
    "ml-IN",
    "ms-MY",
    "nb-NO",
    "nl-BE",
    "nl-NL",
    "pl-PL",
    "pt-BR",
    "pt-PT",
    "ro-RO",
    "ru-RU",
    "sk-SK",
    "sl-SI",
    "sr-RS",
    "sv-SE",
    "ta-IN",
    "te-IN",
    "th-TH",
    "tr-TR",
    "uk-UA",
    "vi-VN",
    "yue-Hant-HK",
    "zh",
    "zh-HK",
    "zh-TW",
]

interface LanguageEntry {
    value: string
    label: string | INodeFieldTranslations
}

export function languageSelectField(
    key: string,
    required: boolean,
    label: INodeFieldTranslations,
    description?: INodeFieldTranslations,
): INodeField {
    const extraEntries: Array<LanguageEntry> = required
        ? []
        : [{ value: "", label: t.shared.inputLanguageDefaultLabel }]
    const languageEntries: Array<LanguageEntry> = supportedLanguages.map(lang => {
        return { value: lang, label: lang }
    })

    return {
        type: "select",
        key: key,
        label: label,
        description: description,
        defaultValue: "",
        params: {
            required: required,
            options: extraEntries.concat(languageEntries),
        },
    }
}

export function convertLanguageSelect(language: string): string {
    if (language === "") {
        return undefined
    }
    return language
}

export interface EndFlowInputs {
    endFlow: boolean
}

export const endFlowField: INodeField = {
    type: "toggle",
    key: "endFlow",
    label: t.shared.inputEndFlowLabel,
    defaultValue: false,
    description: t.shared.inputEndFlowDescription,
    params: {
        required: true,
    },
}

export const commonChildNodeFields: {
    appearance: INodeAppearance
    constraints?: INodeConstraints
} = {
    constraints: {
        editable: false,
        deletable: false,
        creatable: false,
        movable: false,
        placement: {
            predecessor: {
                whitelist: [],
            },
        },
    },
    appearance: {
        color: "#61d188",
        textColor: "white",
        variant: "mini",
    },
}

const generalSectionKey = "general"

export const generalSectionFormElement: INodeFieldAndSectionFormElement = {
    type: "section",
    key: generalSectionKey,
}

export function generalSection(
    fieldKeys: Array<string>,
    defaultCollapsed: boolean = false,
): INodeSection {
    return {
        key: generalSectionKey,
        fields: fieldKeys,
        label: t.shared.sectionGeneralLabel,
        defaultCollapsed: defaultCollapsed,
    }
}
