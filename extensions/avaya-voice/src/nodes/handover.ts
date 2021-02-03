import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

export interface IHandoverParams extends INodeFunctionBaseParams {
	config: {
		handoverType: string;
		destination: string;
		callbackUrl: string;
		user: string;
		domain: string;
		connection: {
			userName: string;
			password: string;
		};
	};
}

export const handoverNode = createNodeDescriptor({
	type: "handover",
	defaultLabel: "Handover",
	fields: [
		{
			key: "handoverType",
			label: "Type",
			type: "select",
			defaultValue: "phone",
			params: {
				options: [
					{
						label: "Phone",
						value: "phone"
					},
					{
						label: "Sip",
						value: "sip"
					}
				]
			}
		},
		{
			key: "destination",
			label: "Destination",
			type: "cognigyText",
			condition: {
				key: "handoverType",
				value: "phone",
			},
			params: {
				required: true
			}
		},
		{
			key: "callbackUrl",
			label: "CallbackUrl",
			type: "cognigyText",
			params: {
				required: false
			}
		},
		{
			key: "user",
			label: "User",
			type: "cognigyText",
			condition: {
				key: "handoverType",
				value: "sip",
			},
			params: {
				required: true
			}
		},
		{
			key: "domain",
			label: "Domain",
			type: "cognigyText",
			condition: {
				key: "handoverType",
				value: "sip",
			},
			params: {
				required: true
			}
		},
		{
			key: "connection",
			label: "Credentials",
			type: "connection",
			condition: {
				key: "handoverType",
				value: "sip",
			},
			params: {
				connectionType: "credential",
				required: true
			}
		}

	],
	sections: [
		{
			key: "sipDetails",
			label: "SIP details",
			defaultCollapsed: true,
			condition: {
				key: "handoverType",
				value: "sip"
			},
			fields: [
				"user",
				"domain",
				"connection"
			]
		}
	],
	form: [
		{ type: "field", key: "handoverType" },
		{ type: "field", key: "destination" },
		{ type: "section", key: "sipDetails" },
		{ type: "field", key: "callbackUrl" }
	],
	function: async({ cognigy, config }: IHandoverParams) => {
		const { api } = cognigy;
		const { handoverType, destination, callbackUrl, user, domain, connection } = config;
		const { userName, password } = connection;

		if (handoverType === "phone") {
			if (!destination) throw new Error('The destination is missing.');
		}
		if (handoverType === "sip") {
			if (!userName) throw new Error("Credential is missing user name");
			if (!password) throw new Error("Credential is missing password]");
			if (!user) throw new Error('User is missing.');
			if (!domain) throw new Error('Domain is missing.');
		}

		console.log(cognigy, config);
		api.output('', {
			"_cognigy": {
				"_spoken": {
					"json": {
						"activities": [{
							"type": "event",
							"name": "handover",
							"activityParams": {
								handoverType,
								destination,
								callbackUrl,
								user,
								domain,
								connection
							}
						}]
					}
				}
			}
		});
	}
});
