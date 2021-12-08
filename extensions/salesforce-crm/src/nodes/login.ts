import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import jsforce from 'jsforce';

export interface ILoginParams extends INodeFunctionBaseParams {
    config: {
        username: string;
        password: string;
        loginUrl: string;
        storeLocation: string;
        contextKey: string;
        inputKey: string;
    };
}
export const loginNode = createNodeDescriptor({
    type: "login",
    defaultLabel: "Log In",
    fields: [
        {
            key: "username",
            type: "cognigyText",
            label: "Username",
            description: "The Salesforce username",
            params: {
                required: true
            }
        },
        {
            key: "password",
            type: "cognigyText",
            label: "Password",
            description: "The Salesforce user password",
            params: {
                required: true
            }
        },
        {
            key: "loginUrl",
            type: "cognigyText",
            label: "Login URL",
            description: "The Salesforce login URL",
            defaultValue: "https://login.salesforce.com",
            params: {
                required: true
            }
        },
        {
            key: "storeLocation",
            type: "select",
            label: "Where to store the result",
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
            type: "text",
            label: "Input Key to store Result",
            defaultValue: "salesforce",
            condition: {
                key: "storeLocation",
                value: "input",
            }
        },
        {
            key: "contextKey",
            type: "text",
            label: "Context Key to store Result",
            defaultValue: "salesforce",
            condition: {
                key: "storeLocation",
                value: "context",
            }
        },
    ],
    sections: [
        {
            key: "storage",
            label: "Storage Option",
            defaultCollapsed: true,
            fields: [
                "storeLocation",
                "inputKey",
                "contextKey",
            ]
        },
        {
            key: "loginOption",
            label: "Login Option",
            defaultCollapsed: true,
            fields: [
                "loginUrl"
            ]
        }
    ],
    form: [
        { type: "field", key: "connection" },
        { type: "field", key: "username" },
        { type: "field", key: "password" },
        { type: "section", key: "loginOption" },
        { type: "section", key: "storage" },
    ],
    appearance: {
        color: "#009EDB"
    },
    function: async ({ cognigy, config }: ILoginParams) => {
        const { api } = cognigy;
        const { username, password, loginUrl, storeLocation, contextKey, inputKey } = config;

        try {

            const conn = new jsforce.Connection({
                loginUrl
            });

            const login = await conn.login(username, password);
            const user = await conn.identity();

            if (storeLocation === "context") {
                api.addToContext(contextKey, {
                    login,
                    user
                }, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, {
                    login,
                    user
                });
            }

        } catch (error) {
            if (storeLocation === "context") {
                api.addToContext(contextKey, error.message, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, error.message);
            }
        }
    }
});