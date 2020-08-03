import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

/**
 * Custom Node to reset the bot's avatar image.
 */
export interface IResetUserAvatar extends INodeFunctionBaseParams {
    config: {
    }
}
export const resetUserAvatar = createNodeDescriptor({
    type: "resetUserAvatar",
    defaultLabel: "Reset User Avatar",
    function: async ({ cognigy }: IResetUserAvatar) => {
        const { api } = cognigy;

        api.output("", {
            "_webchat": {
            "userAvatarOverrideUrl": ""
            }
        });

    }
});
