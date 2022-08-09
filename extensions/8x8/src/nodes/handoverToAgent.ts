import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from "axios";

export interface IHandoverToAgentParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            username: string;
            password: string;
            tenant: string;
            region: string;
        };
        handoverAcceptMessage: string;
        channelId: string;
        language: string;
        name: string;
        email: string;
        company: string;
        documentId: string;
        storeLocation: string;
        contextKey: string;
        inputKey: string;
    };
}

interface I8x8ChannelResponse {
    id: string;
    description: string;
    name: string;
    webHookId: string;
    routingOptions: {
        type: string;
        id: string;
    };
}

export const handoverToAgentNode = createNodeDescriptor({
    type: "handoverToAgent",
    defaultLabel: {
        default: "Handover To Agent"
    },
    summary: {
        default: "Retrieves the results of the uploaded document"
    },
    fields: [
        {
            key: "connection",
            label: {
                default: "8x8 OAuth Connection"
            },
            type: "connection",
            params: {
                connectionType: "8x8",
                required: true
            }
        },
        {
            key: "handoverAcceptMessage",
            label: "Handover Accept Message",
            type: "cognigyText",
            description: "The message to display to the user once the handover request was accepted by the live chat",
            params: {
                required: true
            }
        },
        {
            key: "channelId",
            label: {
                default: "Channel ID"
            },
            description: {
                default: "The ID of the 8x8 Channel"
            },
            type: "select",
            params: {
                required: true,
            },
            optionsResolver: {
                dependencies: ["connection"],
                resolverFunction: async ({ api, config }) => {
                    try {

                        // Authenticate 8x8 requests
                        // Docs: https://developer.8x8.com/contactcenter/reference/createaccesstoken
                        const authenticationResponse = await axios({
                            method: "POST",
                            url: "https://api.8x8.com/oauth/v2/token",
                            headers: {
                                "Accept": "application/json",
                                "Content-Type": "application/x-www-form-urlencoded",
                                // @ts-ignore
                                "Authorization": `Basic ${new Buffer.from(`${config.connection.username}:${config.connection.password}`).toString("base64")}`
                            },
                            data: "grant_type=client_credentials"
                        });

                        const channelsResponse = await api.httpRequest({
                            method: "GET",
                            url: `https://api.8x8.com/vcc/${config.connection.region}/chat/v2/tenant/${config.connection.tenant}/channels`,
                            headers: {
                                "Accept": "application/json",
                                "Authorization": `Bearer ${authenticationResponse?.data?.access_token}`
                            }
                        });

                        // map file list to "options array"
                        return channelsResponse?.data?.data?.map((channel: I8x8ChannelResponse) => {
                            return {
                                label: channel?.name,
                                value: channel?.id,
                            };
                        });
                    } catch (error) {
                        throw new Error(error);
                    }
                }
            }
        },
        {
            key: "language",
            label: {
                default: "Language"
            },
            description: {
                default: "The user's language"
            },
            type: "cognigyText",
            defaultValue: "en"
        },
        {
            key: "name",
            label: {
                default: "Name"
            },
            description: {
                default: "The user's full name"
            },
            type: "cognigyText",
            defaultValue: "Cognigy User"
        },
        {
            key: "email",
            label: {
                default: "Email Address"
            },
            description: {
                default: "The user's email address"
            },
            type: "cognigyText",
            defaultValue: "user@cognigy.com"
        },
        {
            key: "company",
            label: {
                default: "Company"
            },
            description: {
                default: "The user's company"
            },
            type: "cognigyText",
            defaultValue: "External"
        },
        {
            key: "storeLocation",
            type: "select",
            label: {
                default: "Where to store the result"
            },
            defaultValue: "input",
            params: {
                options: [
                    {
                        label: "Input",
                        value: "input"
                    },
                    {
                        label: "Context",
                        value: "context"
                    }
                ],
                required: true
            },
        },
        {
            key: "inputKey",
            type: "cognigyText",
            label: {
                default: "Input Key to store Result"
            },
            defaultValue: "livechat",
            condition: {
                key: "storeLocation",
                value: "input",
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: {
                default: "Context Key to store Result"
            },
            defaultValue: "livechat",
            condition: {
                key: "storeLocation",
                value: "context",
            }
        }
    ],
    sections: [
        {
            key: "storage",
            label: {
                default: "Storage Option",
                deDE: "Speicheroption"
            },
            defaultCollapsed: true,
            fields: [
                "storeLocation",
                "inputKey",
                "contextKey"
            ]
        },
        {
            key: "customer",
            label: {
                default: "User Details"
            },
            defaultCollapsed: true,
            fields: [
                "language",
                "name",
                "email",
                "company"
            ]
        }
    ],
    form: [
        { type: "field", key: "connection" },
        { type: "field", key: "projectId" },
        { type: "section", key: "customer" },
        { type: "section", key: "storage" }
    ],
    appearance: {
        color: "#ff0050"
    },
    dependencies: {
        children: [
            "onProcessing",
            "onExtracted"
        ]
    },
    function: async ({ cognigy, config, childConfigs }: IHandoverToAgentParams) => {
        const { api, input } = cognigy;
        const { connection, handoverAcceptMessage, channelId, language, name, email, company, storeLocation, contextKey, inputKey } = config;
        const { username, password, tenant, region } = connection;

        try {

            api.say(handoverAcceptMessage);

            // Authenticate 8x8 requests
            // Docs: https://developer.8x8.com/contactcenter/reference/createaccesstoken
            const authenticationResponse = await axios({
                method: "POST",
                url: "https://api.8x8.com/oauth/v2/token",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/x-www-form-urlencoded",
                    // @ts-ignore
                    "Authorization": `Basic ${new Buffer.from(`${username}:${password}`).toString("base64")}`
                },
                data: "grant_type=client_credentials"
            });

            const response = await axios({
                method: "POST",
                url: `https://api.8x8.com/vcc/${region}/chat/v2/tenant/${tenant}/conversations`,
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authenticationResponse?.data?.access_token}`
                },
                data: {
                    channelId,
                    customer: {
                        language,
                        name,
                        email,
                        company,
                        cognigyUserId: input.userId,
                        cognigySessionId: input.sessionId,
                        cognigyURLToken: input.URLToken
                    },
                    history: {
                        messages: input?.data?.transcript || []
                    }
                }
            });

            if (storeLocation === "context") {
                api.addToContext(contextKey, response.data, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, response.data);
            }

        } catch (error) {
            api.log("error", error.message);
        }
    }
});