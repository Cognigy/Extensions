import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';

export interface IGetTransactionParams extends INodeFunctionBaseParams {
    config: {
        accessToken: string;
        transactionId: string;
        storeLocation: string;
        inputKey: string;
        contextKey: string;
    };
}

export const getTransactionNode = createNodeDescriptor({
    type: "getTransaction",
    defaultLabel: "Get Transaction",
    summary: "Retrieves the results of a Transaction by id",
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
            key: "transactionId",
            label: "Transaction ID",
            type: "cognigyText",
            defaultValue: "{{context.abbyy.run.transactionId}}",
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
            defaultValue: "abbyy.transaction",
            condition: {
                key: "storeLocation",
                value: "input"
            }
        },
        {
            key: "contextKey",
            type: "text",
            label: "Context Key to store Result",
            defaultValue: "abbyy.transaction",
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
        { type: "field", key: "transactionId" },
        { type: "section", key: "storageOption" },
    ],
    appearance: {
        color: "#ff2038"
    },
    dependencies: {
        children: [
            "onProcessedTransaction",
            "onNotFinishedTransaction"
        ]
    },
    function: async ({ cognigy, config, childConfigs }: IGetTransactionParams) => {
        const { api } = cognigy;
        const { transactionId, accessToken, storeLocation, inputKey, contextKey } = config;

        try {
            const response = await axios({
                method: "get",
                url: `https://vantage-preview.abbyy.com/api/publicapi/v1/transactions/${transactionId}`,
                headers: {
                    "Accept": "application/json",
                    "Authorization": `Bearer ${accessToken}`
                }
            });

            if (response.data.status === "Processed") {
                const transactionFileId: string = response.data.documents[0].resultFiles[0].fileId;

                const fileResponse = await axios({
                    method: "get",
                    url: `https://vantage-preview.abbyy.com/api/publicapi/v1/transactions/${transactionId}/files/${transactionFileId}/download`,
                    headers: {
                        "Accept": "application/json",
                        "Authorization": `Bearer ${accessToken}`
                    }
                });

                const onProcessedTransactionChild = childConfigs.find(child => child.type === "onProcessedTransaction");
                api.setNextNode(onProcessedTransactionChild.id);

                if (storeLocation === "context") {
                    api.addToContext(contextKey, fileResponse.data, "simple");
                } else {
                    // @ts-ignore
                    api.addToInput(inputKey, fileResponse.data);
                }
            } else {

                const onNotFinishedChild = childConfigs.find(child => child.type === "onNotFinishedTransaction");
                api.setNextNode(onNotFinishedChild.id);

                if (storeLocation === "context") {
                    api.addToContext(contextKey, `Transaction with ID ${transactionId} is not of status "Processed" yet.`, "simple");
                } else {
                    // @ts-ignore
                    api.addToInput(inputKey, `Transaction with ID ${transactionId} is not of status "Processed" yet.`);
                }
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

export const onProcessedTransaction = createNodeDescriptor({
    type: "onProcessedTransaction",
    parentType: "getTransaction",
    defaultLabel: "On Processed",
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

export const onNotFinishedTransaction = createNodeDescriptor({
    type: "onNotFinishedTransaction",
    parentType: "getTransaction",
    defaultLabel: "On Not Finished",
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