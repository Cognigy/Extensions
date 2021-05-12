import { createNodeDescriptor, INodeFunctionBaseParams } from '@cognigy/extension-tools';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { TransactionData } from '../../types/uipath';
import { sleep } from '../helper/timeout';

export interface IGetQueueItems extends INodeFunctionBaseParams {
	config: {
		instanceInfo: {
			accountLogicalName: string;
			tenantLogicalName: string;
        };
        accessToken: string;
		orgUnitId: string;
        maxItems: string;
        storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

export const getQueueItemsNode = createNodeDescriptor({
	type: 'getQueueItems',
	defaultLabel: 'Get Queue Items',
	fields: [
		{
			key: 'instanceInfo',
			label: 'Orchestrator Instance Information',
            type: 'connection',
			params: {
				connectionType: 'instanceData',
				required: true
			}
        },
        {
			key: 'accessToken',
            label: 'Orchestrator Access Token',
            description: 'The Bearer Token for the API.',
			type: 'cognigyText',
			params: {
				required: true
			}
        },
		{
			key: "orgUnitId",
			label: "Organization Unit ID",
			type: "cognigyText",
			params: {
				required: true
			}
        },
        {
			key: 'maxItems',
            label: 'Max Number of Results',
            description: 'The maximum number of queue items which should be returned.',
			type: 'cognigyText',
			params: {
				required: true
			}
        },
		{
			key: 'storeLocation',
			type: 'select',
			label: 'Where to Store the Result',
			params: {
				options: [
					{
						label: 'Input',
						value: 'input'
					},
					{
						label: 'Context',
						value: 'context'
					}
				],
				required: true
			},
			defaultValue: 'input'
		},
		{
			key: 'inputKey',
			type: 'cognigyText',
			label: 'Input Key to Store Result',
			defaultValue: 'outputInformation',
			condition: {
				key: 'storeLocation',
				value: 'input'
			}
		},
		{
			key: 'contextKey',
			type: 'cognigyText',
			label: 'Context Key to Store Result',
			defaultValue: 'outputInformation',
			condition: {
				key: 'storeLocation',
				value: 'context'
			}
		}
	],
	sections: [
		{
			key: 'storageOption',
			label: 'Storage Option',
			defaultCollapsed: true,
			fields: [
				'storeLocation',
				'inputKey',
				'contextKey',
			]
		}
	],
	form: [
		{ type: 'field', key: 'instanceInfo' },
        { type: 'field', key: 'accessToken' },
		{ type: 'field', key: 'maxItems' },
		{ type: 'section', key: 'storageOption' },
	],
	appearance: {
		color: "#fa4514"
	},
	function: async ({ cognigy, config }: IGetQueueItems) => {
        const { api } = cognigy;
		const { instanceInfo, accessToken, orgUnitId, maxItems, storeLocation, inputKey, contextKey } = config;
		const { accountLogicalName, tenantLogicalName } = instanceInfo;

        const endpoint = `https://platform.uipath.com/${accountLogicalName}/${tenantLogicalName}/odata/QueueItems?$top=${maxItems}`;
        const axiosConfig: AxiosRequestConfig = {
            headers: {
                'Content-Type': 'application/json',
				'Authorization': `Bearer ${accessToken}`,
				'X-UIPATH-TenantName': tenantLogicalName,
				'X-UIPATH-OrganizationUnitId': orgUnitId
            }
		};

		try {
            let continueLoop = true;
            let response: AxiosResponse <TransactionData>;
            let transactionStatus: any;

            while (continueLoop) {
                response = await axios.get(endpoint, axiosConfig);
                transactionStatus = response.data.value[0].Status;
                if (transactionStatus === 'Successful') {
                    continueLoop = false;
                    if (storeLocation === 'context') {
                        api.addToContext(contextKey, response.data.value[0].Output, 'simple');
                    } else {
                        // @ts-ignore
                        api.addToInput(inputKey, response.data.value[0].Output);
                    }
                } else if (transactionStatus === 'Failed') {
                    continueLoop = false;
                    throw new Error ('Transaction Item not processed successfully.');
                } else {
                    // Set the timeout to 200 MS to avoid to many HTTP Requests
                    await sleep(200);
                }
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