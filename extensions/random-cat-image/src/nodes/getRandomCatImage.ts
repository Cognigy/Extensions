import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';
/**
 * This file contains a simple node with many field types, sections, etc
 *
 * It demonstrates how you can write a new flow-node in Cognigy.AI 4.0.0
 * and shows important concepts
 */
export interface IGetRandomCatImageParams extends INodeFunctionBaseParams {
    config: {
        connection: {
			key: string;
		};
    };
}
export const getRandomCatImage = createNodeDescriptor({
    type: "getRandomCatImage",
    defaultLabel: "Random Cat Image",
    preview: {
        key: "cognigytext",
        type: "text"
    },
    fields: [
        {
            key: "connection",
			label: "The api-key connection which should be used.",
			type: "connection",
			params: {
				connectionType: "api-key"
			}
        },
    ],
    tokens: [
        {
            label: "catImageUrl",
            script: "ci.catImage[0].url",
            type: "answer"
        },
    ],
    appearance: {
        color: "#fc92e5"
    },
    function: async ({ cognigy, config }: IGetRandomCatImageParams) => {
        const { api } = cognigy;
        const { connection } = config;

        try {
            const response = await axios({
                method: 'get',
                url: 'https://api.thecatapi.com/v1/images/search',
                headers: {
                    'x-api-key': connection
                }
            });

            api.output(null, {
                "data": "",
                "linear": false,
                "loop": false,
                "text": [],
                "type": "image",
                "_cognigy": {
                    "_default": {
                        "_image": {
                            "type": "image",
                            "imageUrl": response.data[0].url
                        },
                        "fallbackText": "Great bread stapled to a tree"
                    }
                },
                "_data": {
                    "_cognigy": {
                        "_default": {
                            "_image": {
                                "type": "image",
                                "imageUrl": response.data[0].url
                            },
                            "fallbackText": "Great bread stapled to a tree"
                        }
                    }
                }
            });
            api.addToContext('catImage', response.data[0].url, 'simple');
        } catch (error) {
            throw new Error(error);
        }
    }
});