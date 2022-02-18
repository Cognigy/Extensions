import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

export interface IHangupParams extends INodeFunctionBaseParams {
    config: {};
}

export const hangupNode = createNodeDescriptor({
    type: "hangup",
    defaultLabel: {
        default: "Hang Up",
        deDE: "Auflegen"
    },
    summary: {
        default: "Hangs up an ongoing call in Amazon Connect",
        deDE: "Beendet ein aktuell laufendes Telefonat in Amazon Connect und legt auf"
    },
    appearance: {
        color: "#008995"
    },
    function: async ({ cognigy }: IHangupParams) => {
        const { api } = cognigy;

        api.say("", {
            "connect_action": "HANGUP",
            "connect_action_data": ""
        });
    }
});