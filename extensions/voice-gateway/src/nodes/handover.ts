import {
	createNodeDescriptor,
	INodeFunctionBaseParams
}
from "@cognigy/extension-tools";

import { nodeColor } from '../utils/design';

export interface IHandoverParams extends INodeFunctionBaseParams {
	config: {
		handoverReason: string;
		transferTarget: string;
		transferReferredByURL: string;
	};
}
export const handoverNode = createNodeDescriptor({
	type: "handover",
	defaultLabel: "Handover",
	summary: "Hands the conversations to another target",
	fields: [{
			key: "handoverReason",
			label: "Reason",
			type: "cognigyText",
			defaultValue: "Bot initiated handover",
			params: {
				required: true
			}
		},
		{
			key: "transferTarget",
			label: "Target",
			type: "cognigyText",
			defaultValue: "tel:+49123456789",
			params: {
				required: true
			}
		},
		{
			key: "transferReferredByURL",
			label: "Referral URL",
			type: "cognigyText",
			description: "Adds a SIP Referred-By header to the outgoing INVITE/REFER message",
			defaultValue: ""
		},
	],
	preview: {
		key: "transferTarget",
		type: "text"
	},
	appearance: {
		color: nodeColor
	},
	form: [
		{
			type: "field",
			key: "handoverReason"
		},
		{
			type: "field",
			key: "transferTarget"
		},
		{
			type: "field",
			key: "transferReferredByURL"
		}
	],
	function : async({ cognigy, config }: IHandoverParams) => {
		const {	api } = cognigy;
		const {
			handoverReason,
			transferTarget,
			transferReferredByURL
		} = config;

		if (!handoverReason)
			throw new Error('The handover reason is missing.');
		if (!transferTarget)
			throw new Error('The handover target is missing.');

		api.output(null, {
			"_cognigy": {
				"_audioCodes": {
					"json": {
						"activities": [{
								"type": "event",
								"name": "handover",
								"activityParams": {
									transferTarget,
									handoverReason,
									transferReferredByURL
								}
							}
						]
					}
				}
			}
		});
	}
});
