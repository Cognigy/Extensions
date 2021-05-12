import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios, { AxiosResponse } from 'axios';

export interface IgetSeriesByCreatorIDParams extends INodeFunctionBaseParams {
	config: {
		apiConnection: {
            publicKey: string;
            privateKey: string;
        };
        creatorID: string;
        storeLocation: string;
        inputKey: string;
        contextKey: string;
	};
}

export const getSeriesByCreatorIDNode = createNodeDescriptor({
    type: "getSeriesByCreatorID",
    defaultLabel: "Get Series By Creator ID",
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
            key: "creatorID",
            label: "Creator ID",
            type: "cognigyText",
            description: "ID of the creator of the series. Can be found using the Get Creator Node"
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
			defaultValue: "comicResults",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "comicResults",
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
        { type: "field", key: "creatorID"},
        { type: "section", key: "storageOption"}
    ],
    appearance: {
        color: "#ed1d24"
    },
    function: async ({ cognigy, config }: IgetSeriesByCreatorIDParams) => {
        const { api } = cognigy;
        const { apiConnection, creatorID, storeLocation, inputKey, contextKey } = config;
        const { privateKey, publicKey } = apiConnection;

        const ts =  Date.now();
        const hash = require('crypto').createHash('MD5').update(ts + privateKey + publicKey).digest('hex');

        const endpoint = `https://gateway.marvel.com:443/v1/public/creators/${creatorID}/series?ts=${ts}&apikey=${publicKey}&hash=${hash}`;

    try {
        const result: AxiosResponse = await axios.get(endpoint);
        const series = result.data.data.results;
        let seriesList = [];

        for (const i of series) {
            seriesList.push({
                "title": i.title,
                "subtitle": i.description,
                "imageURL": i.thumbnail.path + ".jpg",
                "fallbackURL": i.urls[0].url
            });
        }
        if (storeLocation === 'context') {
            api.addToContext(contextKey, seriesList, 'simple');
        } else {
            // @ts-ignore
            api.addToInput(inputKey, seriesList);
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