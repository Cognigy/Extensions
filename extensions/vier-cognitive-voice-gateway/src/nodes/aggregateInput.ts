import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools/build"
import t from "../translations"
import { convertDurationFromSecondsToMillis } from "../helpers/util"
import { generalSection, generalSectionFormElement } from "../common/shared"

interface IAggregateInputInputs {
    enable: boolean
    timeout: number
}

export interface IAggregateInputParams extends INodeFunctionBaseParams {
    config: IAggregateInputInputs
}

const timeoutFieldKey: keyof IAggregateInputInputs = "timeout"
const enableFieldKey: keyof IAggregateInputInputs = "enable"

export const aggregateInputNode = createNodeDescriptor({
    type: "aggregate-input",
    defaultLabel: t.aggregateInput.nodeLabel,
    summary: t.aggregateInput.nodeSummary,
    appearance: {
        color: "green",
    },
    tags: ["service"],
    fields: [
        {
            type: "toggle",
            key: enableFieldKey,
            label: t.aggregateInput.enableFieldLabel,
            description: t.aggregateInput.enableFieldDescription,
            defaultValue: true,
            params: {
                required: true,
            },
        },
        {
            type: "number",
            key: timeoutFieldKey,
            label: t.aggregateInput.timeoutFieldLabel,
            description: t.aggregateInput.timeoutFieldDescription,
            params: {
                min: 1,
                max: 15,
            },
            defaultValue: 3,
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
    function: async ({ cognigy, config }: IAggregateInputParams) => {
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
                status: "aggregation-start",
                timeout: timeout,
            }
        } else {
            payload = {
                status: "aggregation-stop",
            }
        }
        api.say("", payload)
    },
})
