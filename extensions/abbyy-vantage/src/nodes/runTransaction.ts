import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';

export interface IRunTransactionParams extends INodeFunctionBaseParams {
    config: {
        accessToken: string;
        skillId: string;
        fileName: string;
        fileContent: string;
        storeLocation: string;
        inputKey: string;
        contextKey: string;
    };
}

export const runTransactionNode = createNodeDescriptor({
    type: "runTransaction",
    defaultLabel: "Run Transaction",
    summary: "Runs a Transaction with a given skill",
    fields: [
        {
            key: "accessToken",
            label: "Access Token",
            type: "cognigyText",
            defaultValue: "{{context.abbyy.auth.access_token}}",
            params: {
                required: true
            }
        },
        {
            key: "skillId",
            label: "Skill ID",
            type: "cognigyText",
            defaultValue: "{{context.abbyy.skills[0].id}}",
            params: {
                required: true
            }
        },
        {
            key: "fileName",
            label: "File Name",
            type: "cognigyText",
            defaultValue: "picture.jpg",
            params: {
                required: true
            }
        },
        {
            key: "fileContent",
            label: "File Content",
            type: "cognigyText",
            defaultValue: "",
            params: {
                required: true
            }
        },
        {
            key: "storeLocation",
            type: "select",
            label: "Where to store the result",
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
            defaultValue: "input"
        },
        {
            key: "inputKey",
            type: "text",
            label: "Input Key to store Result",
            defaultValue: "abbyy.run",
            condition: {
                key: "storeLocation",
                value: "input"
            }
        },
        {
            key: "contextKey",
            type: "text",
            label: "Context Key to store Result",
            defaultValue: "abbyy.run",
            condition: {
                key: "storeLocation",
                value: "context"
            }
        }
    ],
    sections: [
        {
            key: "storageOption",
            label: "Storage Option",
            defaultCollapsed: true,
            fields: [
                "storeLocation",
                "inputKey",
                "contextKey",
            ]
        }
    ],
    form: [
        { type: "field", key: "accessToken" },
        { type: "field", key: "skillId" },
        { type: "field", key: "fileName" },
        { type: "field", key: "fileContent" },
        { type: "section", key: "storageOption" },
    ],
    appearance: {
        color: "#ff2038"
    },
    dependencies: {
        children: [
            "onScheduledTransaction",
            "onErrorTransaction"
        ]
    },
    function: async ({ cognigy, config, childConfigs }: IRunTransactionParams) => {
        const { api } = cognigy;
        const { skillId, fileContent, fileName, accessToken, storeLocation, inputKey, contextKey } = config;

        try {
            const response = await axios({
                method: "post",
                url: "https://vantage-preview.abbyy.com/api/publicapi/v1/skills",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Accept": "application/json",
                    "Authorization": `Bearer ${accessToken}`
                },
                data: {
                    skillId,
                    file: {
                        content: fileContent
                    },
                    fileName
                }
            });

            const onScheduledTransactionChild = childConfigs.find(child => child.type === "onScheduledTransaction");
            api.setNextNode(onScheduledTransactionChild.id);

            if (storeLocation === "context") {
                api.addToContext(contextKey, response.data, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, response.data);
            }
        } catch (error) {

            const onErrorTransactionChild = childConfigs.find(child => child.type === "onErrorTransaction");
            api.setNextNode(onErrorTransactionChild.id);

            if (storeLocation === "context") {
                api.addToContext(contextKey, error.message, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, error.message);
            }
        }
    }
});

export const onScheduledTransaction = createNodeDescriptor({
    type: "onScheduledTransaction",
    parentType: "runTransaction",
    defaultLabel: "On Scheduled",
    constraints: {
        editable: false,
        deletable: false,
        creatable: false,
        movable: false,
        placement: {
            predecessor: {
                whitelist: []
            }
        }
    },
    appearance: {
        color: "#61d188",
        textColor: "white",
        variant: "mini"
    }
});

export const onErrorTransaction = createNodeDescriptor({
    type: "onErrorTransaction",
    parentType: "runTransaction",
    defaultLabel: "On Error",
    constraints: {
        editable: false,
        deletable: false,
        creatable: false,
        movable: false,
        placement: {
            predecessor: {
                whitelist: []
            }
        }
    },
    appearance: {
        color: "#cf142b",
        textColor: "white",
        variant: "mini"
    }
});