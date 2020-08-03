import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

/**
 * Custom Node to reset the bot's avatar image.
 */
export interface IResetBotAvatar extends INodeFunctionBaseParams {
    config: {
    }
}
export const resetBotAvatar = createNodeDescriptor({
    type: "resetBotAvatar",
    defaultLabel: "Reset Bot Avatar",
    function: async ({ cognigy }: IResetBotAvatar) => {
        const { api } = cognigy;
        api.output("", {
            "_webchat": {
            "botAvatarOverrideUrl": ""
            }
        });

    }
});