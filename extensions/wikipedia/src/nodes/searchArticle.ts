import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from "axios";

export interface ISearchArticleParams extends INodeFunctionBaseParams {
	config: {
		title: string;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const searchArticleNode = createNodeDescriptor({
	type: "searchArticle",
	defaultLabel: "Search Article",
	summary: "Search for an article on Wikipedia",
	fields: [
		{
			key: "title",
			label: "Title",
			type: "cognigyText",
			description: "The article title that should be searched for",
			defaultValue: "{{input.text}}",
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
			type: "cognigyText",
			label: "Input Key to store Result",
			defaultValue: "wikipedia",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "wikipedia",
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
		}
	],
	form: [
		{ type: "field", key: "title" },
		{ type: "section", key: "storage" }
	],
	appearance: {
		color: "black"
	},
    dependencies: {
        children: [
            "onFoundArticle",
            "onNotFoundArticle"
        ]
    },
	function: async ({ cognigy, config, childConfigs }: ISearchArticleParams) => {
		const { api } = cognigy;
		const { title, storeLocation, contextKey, inputKey } = config;

		try {
			const response = await axios({
				method: "get",
				url: `https://en.wikipedia.org/api/rest_v1/page/summary/${title}`,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				}
			});


            if (response.status === 404) {
                const onErrorChild = childConfigs.find(child => child.type === "onNotFoundArticle");
                api.setNextNode(onErrorChild.id);

                if (storeLocation === "context") {
                    api.addToContext(contextKey, response.data, "simple");
                } else {
                    // @ts-ignore
                    api.addToInput(inputKey, response.data);
                }
            } else {
                const onSuccessChild = childConfigs.find(child => child.type === "onFoundArticle");
                api.setNextNode(onSuccessChild.id);

                if (storeLocation === "context") {
                    api.addToContext(contextKey, response.data, "simple");
                } else {
                    // @ts-ignore
                    api.addToInput(inputKey, response.data);
                }
            }
		} catch (error) {
			if (storeLocation === "context") {
				api.addToContext(contextKey, { error: error.message }, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, { error: error.message });
			}
		}
	}
});

export const onFoundArticle = createNodeDescriptor({
    type: "onFoundArticle",
    parentType: "searchArticle",
    defaultLabel: "On Found",
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

export const onNotFoundArticle = createNodeDescriptor({
    type: "onNotFoundArticle",
    parentType: "searchArticle",
    defaultLabel: "On Not Found",
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