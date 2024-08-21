import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools/build"
import t from "../translations"
import { normalizeText } from "../helpers/util"
import {
    bargeInFieldsWithToggleToUseDefault,
    bargeInForm,
    BargeInInputsWithToggleToUseDefault,
    bargeInSectionWithToggleToUseDefault,
    convertBargeInIfChanged,
} from "../common/bargeIn"
import { generalSection, generalSectionFormElement } from "../common/shared"
import { INodeField } from "@cognigy/extension-tools/build/interfaces/descriptor"

interface IPlayNodeInputs extends BargeInInputsWithToggleToUseDefault {
    url: string
    fallbackText?: string
    mode?: string
}

export interface IPlayNodeParams extends INodeFunctionBaseParams {
    config: IPlayNodeInputs
}

export const playModeField: INodeField = {
    type: "select",
    key: "mode",
    label: t.play.modeLabel,
    description: t.play.modeDescription,
    defaultValue: "FOREGROUND",
    params: {
        required: true,
        options: [
            { value: "FOREGROUND", label: t.play.modeForegroundOption },
            { value: "BACKGROUND", label: t.play.modeBackgroundOption },
        ],
    },
}

export const playNode = createNodeDescriptor({
    type: "playAudioFile",
    defaultLabel: t.play.nodeLabel,
    summary: t.play.nodeSummary,
    appearance: {
        color: "#678465",
    },
    tags: ["message"],
    fields: [
        {
            type: "cognigyText",
            key: "url",
            label: t.play.inputUrlLabel,
            description: t.play.inputUrlLabelDescription,
            params: {
                required: true,
                placeholder: "",
            },
        },
        {
            type: "cognigyText",
            key: "fallbackText",
            label: t.play.inputFallbackTextLabel,
            description: t.play.inputFallbackTextDescription,
            params: {
                required: false,
                placeholder: "",
            },
            condition: {
                key: "mode",
                value: "FOREGROUND",
            },
        },
        playModeField,
        ...bargeInFieldsWithToggleToUseDefault(),
    ],
    sections: [
        generalSection(["url", "mode", "fallbackText"]),
        bargeInSectionWithToggleToUseDefault({
            key: "mode",
            value: "FOREGROUND",
        }),
    ],
    form: [generalSectionFormElement, bargeInForm],
    function: async ({ cognigy, config }: IPlayNodeParams) => {
        const { api } = cognigy

        const playInBackground: boolean = config.mode === "BACKGROUND"

        const payload = {
            status: "play",
            url: config.url,
            mode: config.mode,
            bargeIn: playInBackground ? undefined : convertBargeInIfChanged(api, config),
            fallbackText: playInBackground ? undefined : normalizeText(config.fallbackText),
        }

        api.say("", payload)
    },
})
