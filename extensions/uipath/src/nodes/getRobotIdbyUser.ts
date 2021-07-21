// Implementation not complete. Needs some work

import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

export interface IGetRobotsIdsbyUserParams extends INodeFunctionBaseParams {
	config: {
		authType: string;
		instanceInfo: {
			accountLogicalName: string;
			tenantLogicalName: string;
			clientId: string;
			userKey: string;
		};
		onPremAuthConnection: {
			orchestratorUrl: string;
			tenancyName: string;
			usernameOrEmailAddress: string;
			password: string;
		};
		userName: string;
		accessToken: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

export const getRobotIdbyUserNode = createNodeDescriptor({
	type: "getRobotIdbyUser",
	defaultLabel: "Get Robots By Username",
	summary: "Get a specific Robot ID if using classic folders.",
	fields: [
		{
			key: "authType",
			label: "Connection Type",
			type: "select",
			description: "Please choose the type of connection",
			params: {
				options: [
					{
						label: "On-premise",
						value: "onPrem"
					},
					{
						label: "Cloud",
						value: "cloud"
					}
				],
				required: true
			},
			defaultValue: "cloud"
		},
		{
			key: "instanceInfo",
			label: "Orchestrator Instance Information",
			type: "connection",
			params: {
				connectionType: 'instanceData',
				required: false
			},
			condition: {
			 	key: "authType",
			 	value: "cloud"
			}
		},
		{
            key: "onPremAuthConnection",
            label: "UiPath On-Prem Connection",
            type: "connection",
            params: {
                 connectionType: "onPremAuth",
                 required: false
            },
			 condition: {
			 	key: "authType",
			 	value: "onPrem"
			}
        },
		{
			key: "userName",
			label: "Username of robot in UiPath",
			type: "cognigyText",
			description: "Please give the username of the unattended or attended robot which should be run.",
			params: {
				required: true
			}
		},
		{
			key: "accessToken",
			label: "Access Token",
			type: "cognigyText",
			params: {
				required: true
			}
		},
		{
			key: "storeLocation",
			type: "select",
			label: "Where to Store the Result",
			params: {
				options: [
					{
						label: "Input",
						value: "input"
					},
					{
						label: "Context",
						value: "context"
					}
				],
				required: true
			},
			defaultValue: "input"
		},
		{
			key: "inputKey",
			type: "cognigyText",
			label: "Input Key to Store Result",
			defaultValue: "uipath.robotIds",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "uipath.robotIds",
			condition: {
				key: "storeLocation",
				value: "context"
			}
		}
	],
	sections: [
		{
			key: "storageOption",
			label: "Storage Option",
			defaultCollapsed: true,
			fields: [
				"storeLocation",
				"inputKey",
				"contextKey",
			]
		}
	],
	form: [
		{ type: "field", key: "authType" },
		{ type: "field", key: "onPremAuthConnection" },
		{ type: "field", key: "instanceInfo" },
		{ type: "field", key: "userName" },
		{ type: "field", key: "accessToken" },
		{ type: "section", key: "storageOption" }
	],
	tokens: [
		{
			label: "Unattended Robot ID Context",
			script: "cc.uipath.robotIds.value[0].UnattendedRobot.RobotId",
			type: "context"
		},
		{
			label: "Attended Robot ID Context",
			script: "cc.uipath.robotIds.value[0].RobotProvision.RobotId",
			type: "context"
		},
		{
			label: "Unattended Robot ID Input",
			script: "ci.uipath.robotIds.value[0].UnattendedRobot.RobotId",
			type: "input"
		},
		{
			label: "Attended Robot ID Input",
			script: "ci.uipath.robotIds.value[0].RobotProvision.RobotId",
			type: "input"
		}
	],
	appearance: {
		color: "#fa4514"
	},
	function: async ({ cognigy, config }: IGetRobotsIdsbyUserParams) => {
		const { api } = cognigy;
		const { instanceInfo, accessToken, storeLocation, inputKey, contextKey, authType, onPremAuthConnection, userName } = config;

		let endpoint;
		let tenantInfo;
		if (authType === 'cloud') {
			const { accountLogicalName, tenantLogicalName } = instanceInfo;
			endpoint = `https://platform.uipath.com/${accountLogicalName}/${tenantLogicalName}/odata/users/`;
			tenantInfo = tenantLogicalName;
	 	} else { // onPrem
			const { tenancyName, orchestratorUrl } = onPremAuthConnection;
			endpoint = `https://${orchestratorUrl}/odata/users/`;
			tenantInfo = tenancyName;
		}
		const axiosConfig: AxiosRequestConfig = {
			params: {
				$filter: `username eq '${userName}'`
			},
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${accessToken}`,
				'X-UIPATH-TenantName': tenantInfo
			}
		};
		try {
			const result: AxiosResponse = await axios.get(endpoint, axiosConfig);
			if (storeLocation === 'context') {
				api.addToContext(contextKey, result.data, 'simple');
			} else {
				// @ts-ignore
				api.addToInput(inputKey, result.data);
			}
		} catch (error) {
			if (storeLocation === 'context') {
				api.addToContext(contextKey, { error: error.message }, 'simple');
			} else {
				// @ts-ignore
				api.addToInput(inputKey, { error: error.message });
			}
		}
	}
});