import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios, { AxiosResponse } from 'axios';

export interface IgetCharacterParams extends INodeFunctionBaseParams {
	config: {
		apiConnection: {
            publicKey: string;
            privateKey: string;
        };
        charName: string;
        storeLocation: string;
        inputKey: string;
        contextKey: string;
	};
}

export const getCharacterNode = createNodeDescriptor({
    type: "getCharacter",
    defaultLabel: "Get Character",
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
            key: "charName",
            label: "Character Name",
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
			defaultValue: "charResults",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "charResults",
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
        { type: "field", key: "charName"},
        { type: "section", key: "storageOption"}
    ],
    appearance: {
        color: "#ed1d24"
    },
    function: async ({ cognigy, config }: IgetCharacterParams) => {
        const { api } = cognigy;
        const { apiConnection, charName, storeLocation, inputKey, contextKey } = config;
        const { privateKey, publicKey } = apiConnection;

        const ts =  Date.now();
        const hash = require('crypto').createHash('MD5').update(ts + privateKey + publicKey).digest('hex');

        const endpoint = `https://gateway.marvel.com:443/v1/public/characters?name=${charName}&ts=${ts}&apikey=${publicKey}&hash=${hash}`;

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