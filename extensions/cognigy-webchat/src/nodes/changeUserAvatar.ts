import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

/**
 * Custom Node to change the user's avatar image.
 */
export interface IChangeUserAvatar extends INodeFunctionBaseParams {
    config: {
        avatarURL: any;
    }
}
export const changeUserAvatar = createNodeDescriptor({
    type: "changeUserAvatar",
    defaultLabel: "Change User Avatar",
    preview: {
        key: "avatarURL",
        type: "text"
    },
    fields: [
        {
            key: "avatarURL",
            label: "The image URL of the new User avatar",
            type: "cognigyText",
            params: {
                required: true
            },
        }
    ],
    function: async ({ cognigy, config }: IChangeUserAvatar) => {
        const { api } = cognigy;
        const { avatarURL } = config;

        if (!avatarURL) throw new Error('No avatar url defined. You need this to change the avatar image of the bot');

        api.output("", {
            "_webchat": {
            "userAvatarOverrideUrl": avatarURL
            }
        });

    }
});