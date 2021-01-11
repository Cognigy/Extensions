import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

export interface IPlayParams extends INodeFunctionBaseParams {
	config: {
    url: string;
    text: string;
	};
}

export const playNode = createNodeDescriptor({
	type: "play",
	defaultLabel: "Play",
	fields: [{
			key: "url",
			label: "URL",
			type: "cognigyText",
			params: {
				required: true
			}
		}, {
      key: "text",
			label: "Text",
			type: "cognigyText",
			params: {
				required: false
			}
    }],
    form: [
      {
        type: "field",
        key: "url"
      }, {
        type: "field",
        key: "text"
      }
    ],
    function: async({ cognigy, config } : IPlayParams) => {
      const { api } = cognigy;
      const { url, text } = config;

		  if (!url) {
			  throw new Error('The url is missing.');
		  }

		api.output('', {
			"_cognigy": {
				"_spoken": {
					"json": {
						"activities": [{
								"type": "event",
								"name": "play",
								"activityParams": {
                  url,
                  text
								}
							}
						]
					}
				}
			}
		});
	}
});
