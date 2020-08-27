import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";


/**
 * Custom Node to change the bot's avatar image.
 */
export interface IChangeBotAvatar extends INodeFunctionBaseParams {
    config: {
        avatarURL: any;
    };
}
export const changeBotAvatar = createNodeDescriptor({
    type: "changeBotAvatar",
    defaultLabel: "Change Bot Avatar",
    preview: {
        key: "avatarURL",
        type: "text"
    },
    fields: [
        {
            key: "avatarURL",
            label: "The image URL of the new Bot avatar",
            type: "cognigyText",
            params: {
                required: true
            },
        }
    ],
    function: async ({ cognigy, config }: IChangeBotAvatar) => {
        const { api } = cognigy;
        const { avatarURL } = config;

        if (!avatarURL) throw new Error('No avatar url defined. You need this to change the avatar image of the bot');

        api.output("", {
            "_webchat": {
            "botAvatarOverrideUrl": avatarURL
            }
        });

    }
});
