import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { StartJob } from "../../types/uipath";

export interface ICreateTokenParams extends INodeFunctionBaseParams {
	config: {
		instanceInfo: {
			accountLogicalName: string;
			tenantLogicalName: string;
		};
		accessToken: string;
        releaseKey: string;
        robotIds: {ids: string []};
        storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

export const startJobNode = createNodeDescriptor({
	type: "startJobNode",
	defaultLabel: "Start a specific job",
	fields: [
		{
			key: "instanceInfo",
			label: "Orchestrator Instance Information",
			type: "connection",
			params: {
				connectionType: 'instanceData',
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
			key: "releaseKey",
			label: "Process Release Key",
			type: "cognigyText",
			params: {
				required: true
			}
        },
        {
			key: "robotIds",
			label: "Robot IDs",
			type: "json",
			defaultValue: `{ "ids": [] }`,
			params: {
				required: true
			}
        },
		{
			key: "storeLocation",
			type: "select",
			label: "Where to store the result",
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
			label: "Input Key to store Result",
			defaultValue: "uiPathProcessState",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "uiPathProcessState",
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
		{ type: "field", key: "instanceInfo" },
		{ type: "field", key: "accessToken" },
		{ type: "field", key: "releaseKey" },
		{ type: "field", key: "robotIds" },
		{ type: "section", key: "storageOption" }
	],
	appearance: {
		color: "#2d7cc2"
	},
	function: async ({ cognigy, config }: ICreateTokenParams) => {
		const { api } = cognigy;
		const { instanceInfo, accessToken, releaseKey, robotIds, storeLocation, inputKey, contextKey } = config;
		const { accountLogicalName, tenantLogicalName } = instanceInfo;

        const endpoint = `https://platform.uipath.com/${accountLogicalName}/${tenantLogicalName}/odata/Jobs/UiPath.Server.Configuration.OData.StartJobs`;
        const axiosConfig: AxiosRequestConfig = {
            headers: {
                'Content-Type': 'application/json',
				'Authorization': `Bearer ${accessToken}`,
				'X-UIPATH-TenantName': tenantLogicalName
            }
        };

        const data = {
            startInfo: {
                ReleaseKey: releaseKey,
                RobotIds: robotIds.ids,
                Strategy: "Specific"
              }
		};

		try {
            const result: AxiosResponse <StartJob> =  await axios.post(endpoint, data, axiosConfig);

			if (storeLocation === 'context') {
				api.addToContext(contextKey, result.data.value[0] , 'simple');
			} else {
				// @ts-ignore
				api.addToInput(inputKey, result.data.value[0]);
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