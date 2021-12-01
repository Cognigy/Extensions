import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { AccessToken, StartJob } from "../../../types/uipath";

export interface IStartJobSimplifiedParams extends INodeFunctionBaseParams {
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
		storeLocation: string;
		inputKey: string;
		contextKey: string;
		releaseName: string;
		useClassicFolders: boolean;
		inputArguments: string;
		robotIds: string;
	};
}

export const startJobSimplifiedNode = createNodeDescriptor({
	type: "startJobSimplifiedNode",
	defaultLabel: "Start a Job (Simplified)",
	summary: "Consolidates all the important UiPath Functions into one Node.",
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
				connectionType: "instanceData",
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
			key: "releaseName",
			label: "Name of Release",
			type: "cognigyText",
			params: {
				required: true
			}
		},
		{
			key: "useClassicFolders",
			label: "Use Classic Folders",
			type: "toggle",
			description: "Use API call for classic folders / Specify specific robot ID?",
			defaultValue: false
		},
		{
			key: "robotIds",
			label: "Robot IDs",
			type: "cognigyText",
			params: {
				required: true
			},
			condition: {
				key: "useClassicFolders",
				value: true
			}
		},
		{
			key: "inputArguments",
			label: "Input Arguments",
			type: "json",
			defaultValue: {},
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
			defaultValue: "uiPathAccessToken",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to Store Result",
			defaultValue: "uiPathStartJobSimplified",
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
		{ type: "field", key: "instanceInfo" },
		{ type: "field", key: "onPremAuthConnection" },
		{ type: "field", key: "releaseName" },
		{ type: "field", key: "useClassicFolders" },
		{ type: "field", key: "robotIds" },
		{ type: "field", key: "inputArguments" },
		{ type: "section", key: "storageOption" },
	],
	appearance: {
		color: "#fa4514"
	},
	function: async ({ cognigy, config }: IStartJobSimplifiedParams) => {
		const { api } = cognigy;
		const { instanceInfo, storeLocation, inputKey, contextKey, authType, onPremAuthConnection, useClassicFolders, releaseName, inputArguments, robotIds } = config;

		let endpointAuth;
		let dataAuth;
		let endpointGetProcess;
		let resultGetProcess;
		let endpointStartJob;
		let dataStartJob;
		let resultStartJob;
		let tenantInfo;
		let accessToken;
		let orgUnitId;
		let ids = [];
		ids.push(robotIds);
		let errorAuth;
		let errorGetProcess;
		let errorStartJob;

		if (authType === 'cloud') {
			const { clientId, userKey, accountLogicalName, tenantLogicalName } = instanceInfo;
			endpointAuth = 'https://account.uipath.com/oauth/token';
			dataAuth = {
				'grant_type': "refresh_token",
				'client_id': clientId,
				'refresh_token': userKey
			};
			endpointGetProcess = `https://platform.uipath.com/${accountLogicalName}/${tenantLogicalName}/odata/Releases/`;
			endpointStartJob = `https://platform.uipath.com/${accountLogicalName}/${tenantLogicalName}/odata/Jobs/UiPath.Server.Configuration.OData.StartJobs`;
			tenantInfo = tenantLogicalName;
		} else { // onPrem
			const { tenancyName, orchestratorUrl, password, usernameOrEmailAddress } = onPremAuthConnection;
			endpointAuth = `https://${orchestratorUrl}/api/account/authenticate`;
			dataAuth = {
				'tenancyName': tenancyName,
				'usernameOrEmailAddress': usernameOrEmailAddress,
				'password': password
			};
			endpointGetProcess = `https://${orchestratorUrl}/odata/Releases/`;
			endpointStartJob = `https://${orchestratorUrl}/odata/Jobs/UiPath.Server.Configuration.OData.StartJobs`;
			tenantInfo = tenancyName;
		}
		const axiosConfigAuth: AxiosRequestConfig = {
			"headers":
			{
				"Content-Type": "application/json"
			}
		};

		try {
			const responseAuth: AxiosResponse<AccessToken> = await axios.post(endpointAuth, dataAuth, axiosConfigAuth);
			if (authType === 'cloud') {
				accessToken = responseAuth.data.access_token;
			} else if (authType === 'onPrem') {
				accessToken = responseAuth.data.result;
			}
		} catch (error) {
			errorAuth = error.message;
		}

		const axiosConfigGetProcess: AxiosRequestConfig = {
			params: {
				$filter: `Name eq '${releaseName}'`
			},
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${accessToken}`,
				'X-UIPATH-TenantName': tenantInfo
			}
		};

		try {
			const responseGetProcess: AxiosResponse = await axios.get(endpointGetProcess, axiosConfigGetProcess);
			resultGetProcess = responseGetProcess.data.value[0].Key;
			orgUnitId = responseGetProcess.data.value[0].OrganizationUnitId;
		} catch (error) {
			errorGetProcess = error.message;
		}

		const axiosConfigStartJob: AxiosRequestConfig = {
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${accessToken}`,
				'X-UIPATH-TenantName': tenantInfo,
				'X-UIPATH-OrganizationUnitId': orgUnitId
			}
		};

		if (useClassicFolders === true) {
			dataStartJob = {
				startInfo: {
					ReleaseKey: resultGetProcess,
					RobotIds: ids,
					Strategy: "Specific",
					InputArguments: JSON.stringify(inputArguments)
				}
			};
		} else {
			dataStartJob = {
				startInfo: {
					ReleaseKey: resultGetProcess,
					Strategy: "ModernJobsCount",
					JobsCount: 1,
					InputArguments: JSON.stringify(inputArguments)
				}
			};
		}

		try {
			const responseStartJob: AxiosResponse<StartJob> = await axios.post(endpointStartJob, dataStartJob, axiosConfigStartJob);
			resultStartJob = responseStartJob.data.value[0];
			if (storeLocation === 'context') {
				api.addToContext(contextKey, { accessToken, resultGetProcess, resultStartJob }, 'simple');
			} else {
				// @ts-ignore
				api.addToInput(inputKey, { accessToken, resultGetProcess, resultStartJob });
			}
		} catch (error) {
			errorStartJob = error.message;
			if (storeLocation === 'context') {
				api.addToContext(contextKey, { errorAuth, errorGetProcess, errorStartJob }, 'simple');
			} else {
				// @ts-ignore
				api.addToInput(inputKey, { errorAuth, errorGetProcess, errorStartJob });
			}

		}
	}
});