import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";


export interface ISendTimePickerParams extends INodeFunctionBaseParams {
	config: {
        attachmentId: string;
        title: string;
        latitude: string;
        longitude: string;
        radius: number;
        timeslots: object;
	};
}
export const sendTimePickerNode = createNodeDescriptor({
	type: "sendTimePickerRingCentral",
	defaultLabel: "Send Time Picker",
	fields: [
        {
            key: "timeslots",
            type: "json",
            label: "timeslots",
            description: "The time slots that will be displayed.",
            defaultValue: `[
    {
        "duration": 3000,
        "start_time": "2020-04-26T08:00+0200",
        "identifier": "timeslot 1"
    }
]`
        },
		{
            key: "attachmentId",
            type: "cognigyText",
            label: "Attachment ID",
            description: "The RingCentral Attachment ID for the image that should be used"
        },
        {
            key: "title",
            type: "cognigyText",
            label: "Title"
        },
        {
            key: "radius",
            type: "number",
            label: "Radius"
        },
        {
            key: "latitude",
            type: "cognigyText",
            label: "Latitude"
        },
        {
            key: "longitude",
            type: "cognigyText",
            label: "Longitude"
        }
    ],
    sections: [
        {
            key: "location",
            label: "Location",
            defaultCollapsed: true,
            fields: [
                "title",
                "radius",
                "latitude",
                "longitude"
            ]
        },
        {
            key: "attachment",
            label: "Attachment",
            defaultCollapsed: true,
            fields: [
                "attachmentId"
            ]
        }
    ],
	form: [
		{ type: "field", key: "timeslots" },
        { type: "section", key: "location" },
        { type: "section", key: "attachment" }
	],
	appearance: {
		color: "#FF8800"
	},
	function: async ({ cognigy, config }: ISendTimePickerParams) => {
		const { api } = cognigy;
		const { attachmentId, title, timeslots, latitude, longitude, radius } = config;

		api.say('', {
			_cognigy: {
				_ringCentralEngage: {
					json: {
						command: "structured-content",
						structuredContent: {
                            type: "time_select",
                            attachment_id: attachmentId,
                            location: {
                                latitude,
                                longitude,
                                radius,
                                title
                            },
                           timeslots
						}
					}
				}
			}
		});
	}
});