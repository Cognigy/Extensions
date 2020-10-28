import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

export interface IGetReleasesParams extends INodeFunctionBaseParams {
	config: {
		instanceInfo: {
			accountLogicalName: string;
			tenantLogicalName: string;
		};
		accessToken: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

export const getReleasesNode = createNodeDescriptor({
	type: "getReleases",
	defaultLabel: "Get Releases",
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
			defaultValue: "uipath.releases",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "uipath.releases",
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
		{ type: "section", key: "storageOption" }
	],
	appearance: {
		color: "#2d7cc2"
	},
	function: async ({ cognigy, config }: IGetReleasesParams) => {
		const { api } = cognigy;
		const { instanceInfo, accessToken, storeLocation, inputKey, contextKey } = config;
		const { accountLogicalName, tenantLogicalName } = instanceInfo;

		const endpoint = `https://platform.uipath.com/${accountLogicalName}/${tenantLogicalName}/odata/Releases`;
		const axiosConfig: AxiosRequestConfig = {
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${accessToken}`,
				'X-UIPATH-TenantName': tenantLogicalName
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