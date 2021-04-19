import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios, { AxiosResponse } from 'axios';

export interface IgetComicByNameIssueParams extends INodeFunctionBaseParams {
	config: {
		apiConnection: {
            publicKey: string;
            privateKey: string;
        };
        comicName: string;
        comicNumber: string;
        comicYear: string;
        storeLocation: string;
        inputKey: string;
        contextKey: string;
	};
}

export const getComicByNameIssueNode = createNodeDescriptor({
    type: "getComicByNameIssue",
    defaultLabel: "Get Comic By Name and Issue Number",
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
            key: "comicName",
            label: "Comic Name",
            type: "cognigyText",
            description: "The name of the comic to look for"
        },
        {
            key: "comicNumber",
            label: "Comic Number",
            type: "cognigyText",
            description: "The number of the comic to look for"
        },
        {
            key: "comicYear",
            label: "Year of the First Comic in the Series",
            type: "cognigyText",
            description: "The year the first comic in the series came out"
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
        { type: "field", key: "comicName"},
        { type: "field", key: "comicNumber"},
        { type: "field", key: "comicYear"},
        { type: "section", key: "storageOption"}
    ],
    appearance: {
        color: "#ed1d24"
    },
    function: async ({ cognigy, config }: IgetComicByNameIssueParams) => {
        const { api } = cognigy;
        const { apiConnection, comicName, comicNumber, comicYear, storeLocation, inputKey, contextKey } = config;
        const { privateKey, publicKey } = apiConnection;

        const ts =  Date.now();
        const hash = require('crypto').createHash('MD5').update(ts + privateKey + publicKey).digest('hex');

        const endpoint = `https://gateway.marvel.com:443/v1/public/comics?titleStartsWith=${comicName}&startYear=${comicYear}&issueNumber=${comicNumber}&ts=${ts}&apikey=${publicKey}&hash=${hash}`;

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