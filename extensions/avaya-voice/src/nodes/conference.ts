import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

export interface IConferenceParams extends INodeFunctionBaseParams {
	config: {
        conferenceRoom: string;
	};
}

export const conferenceNode = createNodeDescriptor({
    type: "conference",
	defaultLabel: "Conference",
	fields: [
         {
			key: "conferenceRoom",
			label: "Conference Room",
			type: "cognigyText",
			defaultValue: "{{ci.userId}}",
			params: {
				required: true
			}
		},
    ],
    form: [
        {
            type: "field",
            key: "conferenceRoom"
        }
    ],
    function: async({ cognigy, config } : IConferenceParams) => {
        const { api } = cognigy;
        const { conferenceRoom } = config;

        if (!conferenceRoom) {
            throw new Error('The conferenceRoom is missing.');
        }

        api.output('', {
			"_cognigy": {
				"_spoken": {
					"json": {
						"activities": [{
								"type": "event",
								"name": "conference",
								"activityParams": {
									conferenceRoom
								}
							}
						]
					}
				}
			}
		});
    }
});
