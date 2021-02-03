import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";


export interface ISendRichLinkParams extends INodeFunctionBaseParams {
	config: {
        attachmentId: string;
        title: string;
        subtitle: string;
        url: string;
        urlText: string;
	};
}
export const sendRichLinkNode = createNodeDescriptor({
	type: "sendRichLinkRingCentral",
	defaultLabel: "Send Rich Link",
	fields: [
		{
            key: "attachmentId",
            type: "cognigyText",
            label: "Attachment ID",
            description: "The RingCentral Attachment ID for the image that should be used"
        },
        {
            key: "title",
            type: "cognigyText",
            label: "Title",
            params: {
                required: true
            }
        },
        {
            key: "subtitle",
            type: "cognigyText",
            label: "Subtitle",
            params: {
                required: true
            }
        },
        {
            key: "url",
            type: "cognigyText",
            label: "URL",
            params: {
                required: true
            }
        },
        {
            key: "urlText",
            type: "cognigyText",
            label: "URL Text",
            params: {
                required: true
            }
        }
    ],
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
		{ type: "field", key: "title" },
        { type: "field", key: "subtitle" },
        { type: "field", key: "url" },
        { type: "field", key: "urlText" },
        { type: "section", key: "attachment" }
	],
	appearance: {
		color: "#FF8800"
	},
	function: async ({ cognigy, config }: ISendRichLinkParams) => {
		const { api } = cognigy;
		const { attachmentId, title, subtitle, url, urlText } = config;

		api.say('', {
			_cognigy: {
				_ringCentralEngage: {
					json: {
						command: "structured-content",
						structuredContent: {
                            type: "rich_link",
                            attachment_id: attachmentId,
                            attachment_fallback_id: attachmentId,
                            title,
                            subtitle,
                            url,
                            url_fallback: url,
                            url_text: urlText
						}
					}
				}
			}
		});
	}
});