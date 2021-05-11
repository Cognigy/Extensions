import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";


/**
 * Custom Node to change the agent's avatar image.
 */
export interface IChangeAgentAvatar extends INodeFunctionBaseParams {
    config: {
        avatarURL: any;
    };
}
export const changeAgentAvatar = createNodeDescriptor({
    type: "changeAgentAvatar",
    defaultLabel: "Change Agent Avatar",
    preview: {
        key: "avatarURL",
        type: "text"
    },
    fields: [
        {
            key: "avatarURL",
            label: "The image URL of the new Agent avatar",
            type: "cognigyText",
            params: {
                required: true
            },
        }
    ],
    function: async ({ cognigy, config }: IChangeAgentAvatar) => {
        const { api } = cognigy;
        const { avatarURL } = config;

        api.output("", {
            "_webchat": {
            "agentAvatarOverrideUrl": avatarURL
            }
        });
    }
});
