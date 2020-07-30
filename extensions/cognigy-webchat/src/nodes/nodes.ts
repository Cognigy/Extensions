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

/**
 * Custom Node to reset the bot's avatar image.
 */
export interface IResetBotAvatar extends INodeFunctionBaseParams {
    config: {
    };
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

/**
 * Custom Node to change the user's avatar image.
 */
export interface IChangeUserAvatar extends INodeFunctionBaseParams {
    config: {
        avatarURL: any;
    };
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

/**
 * Custom Node to reset the bot's avatar image.
 */
export interface IResetUserAvatar extends INodeFunctionBaseParams {
    config: {
    };
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
