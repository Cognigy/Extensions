import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

/**
 * Custom Node to reset the agent's avatar image.
 */
export interface IResetAgentAvatar extends INodeFunctionBaseParams {
    config: {
    };
}
export const resetAgentAvatar = createNodeDescriptor({
    type: "resetAgentAvatar",
    defaultLabel: "Reset Agent Avatar",
    function: async ({ cognigy }: IResetAgentAvatar) => {
        const { api } = cognigy;
        api.output("", {
            "_webchat": {
                "agentAvatarOverrideUrl": ""
            }
        });
    }
});