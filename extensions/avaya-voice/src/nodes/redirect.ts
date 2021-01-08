import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

export interface IRedirectParams extends INodeFunctionBaseParams {
	config: {
        url: string;
	};
}

export const redirectNode = createNodeDescriptor({
    type: "redirect",
	defaultLabel: "Redirect",
	fields: [
         {
			key: "url",
			label: "URL",
			type: "cognigyText",
			params: {
				required: true
			}
		},
    ],
    form: [
        {
            type: "field",
            key: "url"
        }
    ],
    function: async({ cognigy, config } : IRedirectParams) => {
        const { api } = cognigy;
        const { url } = config;

        if (!url) {
            throw new Error('url is missing.');
        }

        api.output('', {
			"_cognigy": {
				"_spoken": {
					"json": {
						"activities": [{
								"type": "event",
								"name": "redirect",
								"activityParams": {
									url
								}
							}
						]
					}
				}
			}
		});
    }
});
