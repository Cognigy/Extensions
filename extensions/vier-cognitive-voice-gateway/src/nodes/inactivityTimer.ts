import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools/build"
import t from "../translations"
import { convertDurationFromSecondsToMillis } from "../helpers/util"
import { generalSection, generalSectionFormElement } from "../common/shared"

interface IInactivityTimerInputs {
    enable: boolean
    timeout: number
}

export interface IInactivityTimerParams extends INodeFunctionBaseParams {
    config: IInactivityTimerInputs
}

const timeoutFieldKey: keyof IInactivityTimerInputs = "timeout"
const enableFieldKey: keyof IInactivityTimerInputs = "enable"

export const inactivityTimerNode = createNodeDescriptor({
    type: "timer",
    defaultLabel: t.timer.nodeLabel,
    summary: t.timer.nodeSummary,
    appearance: {
        color: "green",
    },
    tags: ["service"],
    fields: [
        {
            type: "toggle",
            key: enableFieldKey,
            label: t.timer.enableTimerLabel,
            description: t.timer.enableTimerDescription,
            defaultValue: true,
            params: {
                required: true,
            },
        },
        {
            type: "number",
            key: timeoutFieldKey,
            label: t.timer.useStartInputsLabel,
            params: {
                min: 2,
                max: 20,
            },
            defaultValue: 10,
            condition: {
                key: enableFieldKey,
                value: true,
            },
        },
    ],
    preview: {
        key: timeoutFieldKey,
        type: "text",
    },
    sections: [generalSection([enableFieldKey, timeoutFieldKey])],
    form: [generalSectionFormElement],
    function: async ({ cognigy, config }: IInactivityTimerParams) => {
        const { api } = cognigy

        let payload: object
        if (config.enable) {
            const timeout = convertDurationFromSecondsToMillis(config.timeout)
            if (!timeout) {
                api.log(
                    "error",
                    "a timeout must be set to a positive number of seconds when starting the inactivity detection!",
                )
                return
            }
            payload = {
                status: "inactivity-start",
                timeout: timeout,
            }
        } else {
            payload = {
                status: "inactivity-stop",
            }
        }
        api.say("", payload)
    },
})
