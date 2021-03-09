import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";


export interface ISendAppleAuthParams extends INodeFunctionBaseParams {
	config: {
        attachmentId: string;
        
        merchant_session: object;
        supported_networks: string[];
	};
}
export const sendAppleAuthNode = createNodeDescriptor({
	type: "sendAppleAuthRingCentral",
	defaultLabel: "Send Apple Authenticate",
	fields: [
		{
            key: "attachmentId",
            type: "cognigyText",
            label: "Attachment ID",
            description: "The RingCentral Attachment ID for the image that should be used"
        },
        {
            key: "response_body",
            type: "cognigyText",
            label: "Text",
            params: {
                required: false
            }
        },
    sections: [
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
        { type: "field", key: "response_body" }
        { type: "section", key: "attachment" }
	],
	appearance: {
		color: "#FF8800"
	},
	function: async ({ cognigy, config }: ISendAppleAuthParams) => {
		const { api } = cognigy;
		const { attachmentId, response_body} = config;

        api.say('', {
			_cognigy: {
				_ringCentralEngage: {
					json: {
						command: "structured-content",
						structuredContent: {
                            type: "authenticate",
                            attachment_id: attachmentId,
                            response_body: response_body
						}
					}
				}
			}
		});
	}
});
