import { createNodeDescriptor, INodeFunctionBaseParams } from '@cognigy/extension-tools';
import axios from 'axios';

export interface IGetAllCategoriesParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            accessToken: string;
            storeHash: string;
        };
        storeLocation: string;
        contextKey: string;
        inputKey: string;
    };
}

export const getAllCategoriesNode = createNodeDescriptor({
    type: 'getAllCategories',
    defaultLabel: {
        default: 'Get All Categories'
    },
    summary: {
        default: 'Retrieves all categories from the store'
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
            defaultValue: 'bigcommerce.categories',
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
            defaultValue: 'bigcommerce.categories',
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
        { type: 'section', key: 'storage' }
    ],
    appearance: {
        color: 'black'
    },
    function: async ({ cognigy, config }: IGetAllCategoriesParams) => {
        const { api } = cognigy;
        const { connection, storeLocation, contextKey, inputKey } = config;
        const { storeHash, accessToken } = connection;

        try {

            const response = await axios({
                method: 'GET',
                url: `https://api.bigcommerce.com/stores/${storeHash}/v3/catalog/categories`,
                headers: {
                    'Accept': 'application/json',
                    'X-Auth-Token': accessToken
                }
            });

            if (storeLocation === 'context') {
                api.addToContext(contextKey, response?.data?.data, 'simple');
            } else {
                // @ts-ignore
                api.addToInput(inputKey, response?.data?.data);
            }

        } catch (error) {
            api.log('error', error.message);
        }
    }
});