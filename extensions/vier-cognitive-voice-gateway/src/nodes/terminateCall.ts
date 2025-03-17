import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools/build"
import { normalizeData } from "../helpers/util"
import t from "../translations"
import { endFlowField, EndFlowInputs } from "../common/shared"

interface ITerminateCallInputs extends EndFlowInputs {
    data?: object
}

export interface ITerminateCallParams extends INodeFunctionBaseParams {
    config: ITerminateCallInputs
}

export const terminateCallNode = createNodeDescriptor({
    type: "terminate",
    defaultLabel: t.terminate.nodeLabel,
    summary: t.terminate.nodeSummary,
    tags: ["service"],
    appearance: {
        color: "red",
    },
    fields: [
        endFlowField,
        {
            type: "json",
            key: "data",
            label: t.shared.inputDataLabel,
            description: t.sendData.inputDataDescription,
            params: {
                required: false,
            },
        },
    ],
    sections: [
        {
            key: "additional",
            label: t.forward.sectionAdditionalDataLabel,
            fields: [endFlowField.key, "data"],
            defaultCollapsed: true,
        },
    ],
    form: [
        {
            key: "additional",
            type: "section",
        },
    ],
    function: async ({ cognigy, config }: ITerminateCallParams) => {
        const { api } = cognigy
        const payload = {
            status: "termination",
            data: normalizeData(api, config.data),
        }
        api.say("", payload)
        if (config.endFlow) {
            api.stopExecution()
        }
    },
})
