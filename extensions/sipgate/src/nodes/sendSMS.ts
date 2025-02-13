import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';

export interface ISendSMSParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			personalAccessTokenId: string;
			personalAccessToken: string;
		};
		recipient: string;
		message: string;
	};
}
export const sendSMSNode = createNodeDescriptor({
	type: "sendSMS",
	defaultLabel: "Send SMS",
	fields: [
		{
			key: "connection",
			label: "sipgate Connection",
			type: "connection",
			params: {
				connectionType: "sipgatePersonalAccessToken",
				required: true
			}
		},
		{
			key: "recipient",
			label: "Receiver Number",
			type: "cognigyText",
			params: {
				required: true,
				placeholder: '+4912644334511'
			}
		},
		{
			key: "message",
			label: "Message ",
			type: "cognigyText",
			params: {
				required: true
			}
		}
	],
	form: [
		{ type: "field", key: "connection" },
		{ type: "field", key: "recipient" },
		{ type: "field", key: "message" },
	],
	appearance: {
		color: "black"
	},
	dependencies: {
        children: [
            "onSuccessSendSMS",
            "onErrorSendSMS"
        ]
    },
	function: async ({ cognigy, config, childConfigs }: ISendSMSParams) => {
		const { api } = cognigy;
		const { connection, recipient, message } = config;
		const { personalAccessTokenId, personalAccessToken } = connection;

		try {
			await axios({
				method: 'post',
				url: `https://api.sipgate.com/v2/sessions/sms`,
				headers: {
					'Accept': 'application/json',
				},
				auth: {
					username: personalAccessTokenId,
					password: personalAccessToken
				},
				data: {
					smsId: "s0",
					recipient,
					message
				}
			});

			const onSuccessChild = childConfigs.find(child => child.type === "onSuccessSendSMS");
            api.setNextNode(onSuccessChild.id);


		} catch (error) {
            const onErrorChild = childConfigs.find(child => child.type === "onErrorSendSMS");
            api.setNextNode(onErrorChild.id);
		}
	}
});

export const onSuccessSendSMS = createNodeDescriptor({
    type: "onSuccessSendSMS",
    parentType: "sendSMS",
    defaultLabel: "On Success",
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
        variant: "mini",
        showIcon: false
    }
});

export const onErrorSendSMS = createNodeDescriptor({
    type: "onErrorSendSMS",
    parentType: "sendSMS",
    defaultLabel: "On Error",
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
        color: "#cf142b",
        textColor: "white",
        variant: "mini",
        showIcon: false
    }
});