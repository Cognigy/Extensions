import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios, { AxiosResponse } from 'axios';

export interface IgetCreatorParams extends INodeFunctionBaseParams {
	config: {
		apiConnection: {
            publicKey: string;
            privateKey: string;
        };
        creatorName: string;
        storeLocation: string;
        inputKey: string;
        contextKey: string;
	};
}

export const getCreatorNode = createNodeDescriptor({
    type: "getCreator",
    defaultLabel: "Get Creator",
    fields: [
        {
            key: "apiConnection",
            label: "Your API Keys",
            type: "connection",
            description: "API authentication information for the Marvel API",
            params: {
                connectionType: 'apiKeys',
                required: true
            }
        },
        {
            key: "creatorName",
            label: "Creator Name",
            type: "cognigyText",
            description: "Cognigy Text for the field to be used for the name search"
        },
        {
			key: "storeLocation",
			type: "select",
			label: "Where to Store the Result",
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
			type: "cognigyText",
			label: "Input Key to Store Result",
			defaultValue: "creatorResults",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "creatorResults",
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
                "contextKey"
            ]
        }
    ],
    form: [
        { type: "field", key: "apiConnection"},
        { type: "field", key: "creatorName"},
        { type: "section", key: "storageOption"}
    ],
    appearance: {
        color: "#ed1d24"
    },
    function: async ({ cognigy, config }: IgetCreatorParams) => {
        const { api } = cognigy;
        const { apiConnection, creatorName, storeLocation, inputKey, contextKey } = config;
        const { privateKey, publicKey } = apiConnection;

        const ts =  Date.now();
        const hash = require('crypto').createHash('MD5').update(ts + privateKey + publicKey).digest('hex');

        const endpoint = `https://gateway.marvel.com:443/v1/public/creators?nameStartsWith=${creatorName}&ts=${ts}&apikey=${publicKey}&hash=${hash}`;

    try {
        const result: AxiosResponse = await axios.get(endpoint);

        if (storeLocation === 'context') {
            api.addToContext(contextKey, result.data, 'simple');
        } else {
            // @ts-ignore
            api.addToInput(inputKey, result.data);
        }
    } catch (error) {
        if (storeLocation === 'context') {
            api.addToContext(contextKey, { error: error.message }, 'simple');
        } else {
            // @ts-ignore
            api.addToInput(inputKey, { error: error.message });
        }
    }
}
});