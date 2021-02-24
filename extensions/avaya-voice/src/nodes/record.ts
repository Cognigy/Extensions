import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

export interface IRecordParams extends INodeFunctionBaseParams {
	config: {
        shouldRecord: boolean;
        actionUrl: string;
	};
}

export const recordNode = createNodeDescriptor({
    type: "record",
	defaultLabel: "Record",
	fields: [
        {
			key: "shouldRecord",
			label: "Record?",
            type: "toggle",
            defaultValue: true,
			params: {
				required: true
			}
        }, {
			key: "actionUrl",
			label: "Action Url",
            type: "cognigyText",
			params: {
				required: false
			}
		},
    ],
    form: [
        {
            type: "field",
            key: "shouldRecord"
        }, {
            type: "field",
            key: "actionUrl"
        }
    ],
    function: async({ cognigy, config } : IRecordParams) => {
        const { api } = cognigy;
        const { shouldRecord, actionUrl } = config;

        api.output('', {
			"_cognigy": {
				"_spoken": {
					"json": {
						"activities": [{
								"type": "event",
								"name": "record",
								"activityParams": {
									shouldRecord,
									actionUrl
								}
							}
						]
					}
				}
			}
		});
    }
});
