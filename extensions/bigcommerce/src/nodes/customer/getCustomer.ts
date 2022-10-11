import { createNodeDescriptor, INodeFunctionBaseParams } from '@cognigy/extension-tools';
import axios from 'axios';

export interface IGetCustomerParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            accessToken: string;
            storeHash: string;
        };
        customerId: number;
        storeLocation: string;
        contextKey: string;
        inputKey: string;
    };
}

export const getCustomerNode = createNodeDescriptor({
    type: 'getCustomer',
    defaultLabel: {
        default: 'Get Customer Info'
    },
    summary: {
        default: 'Retrieves all details of a customer'
    },
    fields: [
        {
            key: 'connection',
            label: {
                default: 'Store Access Token'
            },
            type: 'connection',
            params: {
                connectionType: 'store-api-access-token',
                required: true
            }
        },
        {
            key: 'customerId',
            label: {
                default: 'Customer ID'
            },
            type: "cognigyText",
            description: {
                default: 'The system ID of the customer'
            },
            params: {
                required: true
            }
        },
        {
            key: 'storeLocation',
            type: 'select',
            label: {
                default: 'Where to store the result'
            },
            defaultValue: 'input',
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
        },
        {
            key: 'inputKey',
            type: 'cognigyText',
            label: {
                default: 'Input Key to store Result'
            },
            defaultValue: 'bigcommerce.customer',
            condition: {
                key: 'storeLocation',
                value: 'input',
            }
        },
        {
            key: 'contextKey',
            type: 'cognigyText',
            label: {
                default: 'Context Key to store Result'
            },
            defaultValue: 'bigcommerce.customer',
            condition: {
                key: 'storeLocation',
                value: 'context',
            }
        }
    ],
    sections: [
        {
            key: 'storage',
            label: {
                default: 'Storage Option'
            },
            defaultCollapsed: true,
            fields: [
                'storeLocation',
                'inputKey',
                'contextKey'
            ]
        }
    ],
    form: [
        { type: 'field', key: 'connection' },
        { type: 'field', key: 'customerId' },
        { type: 'section', key: 'storage' }
    ],
    appearance: {
        color: 'black'
    },
    function: async ({ cognigy, config }: IGetCustomerParams) => {
        const { api } = cognigy;
        const { connection, customerId, storeLocation, contextKey, inputKey } = config;
        const { storeHash, accessToken } = connection;

        try {

            const response = await axios({
                method: 'GET',
                url: `https://api.bigcommerce.com/stores/${storeHash}/v3/customers?id:in=${customerId}`,
                headers: {
                    'Accept': 'application/json',
                    'X-Auth-Token': accessToken
                }
            });

            if (storeLocation === 'context') {
                api.addToContext(contextKey, response?.data?.data[0], 'simple');
            } else {
                // @ts-ignore
                api.addToInput(inputKey, response?.data?.data[0]);
            }

        } catch (error) {
            api.log('error', error.message);
        }
    }
});