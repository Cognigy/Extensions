import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools/build"
import t from "../translations"
import { generalSection, generalSectionFormElement } from "../common/shared"

interface IStopPlayNodeInputs {
    url: string
    mode: string
}

export interface IStopPlayNodeParams extends INodeFunctionBaseParams {
    config: IStopPlayNodeInputs
}

export const stopPlayNode = createNodeDescriptor({
    type: "stopPlayAudioFile",
    defaultLabel: t.stopPlay.nodeLabel,
    summary: t.stopPlay.nodeSummary,
    appearance: {
        color: "#678465",
    },
    tags: ["message"],
    fields: [
        {
            type: "cognigyText",
            key: "url",
            label: t.play.inputUrlLabel,
            description: t.stopPlay.inputUrlLabelDescription,
            params: {
                required: true,
                placeholder: "",
            },
        },
        {
            type: "select",
            key: "mode",
            label: t.play.modeLabel,
            description: t.play.modeDescription,
            defaultValue: "FOREGROUND",
            params: {
                required: true,
                options: [
                    { value: "FOREGROUND", label: "Foreground" },
                    { value: "BACKGROUND", label: "Background" },
                ],
            },
        },
    ],
    sections: [generalSection(["url", "mode"])],
    form: [generalSectionFormElement],
    function: async ({ cognigy, config }: IStopPlayNodeParams) => {
        const { api } = cognigy

        const payload = {
            status: "play-stop",
            url: config.url,
            mode: config.mode,
        }

        api.say("", payload)
    },
})
