import { createNodeDescriptor, INodeFunctionBaseParams } from '@cognigy/extension-tools';
import axios from 'axios';

export interface IGetCustomerOrdersParams extends INodeFunctionBaseParams {
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

export const getCustomerOrdersNode = createNodeDescriptor({
    type: 'getCustomerOrders',
    defaultLabel: {
        default: 'Get Customer Orders'
    },
    summary: {
        default: 'Retrieves all orders of a customer'
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
            defaultValue: 'bigcommerce.customer.orders',
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
            defaultValue: 'bigcommerce.customer.orders',
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
    dependencies: {
        children: [
            'onOrders',
            'onNoOrders'
        ]
    },
    function: async ({ cognigy, config, childConfigs }: IGetCustomerOrdersParams) => {
        const { api } = cognigy;
        const { connection, customerId, storeLocation, contextKey, inputKey } = config;
        const { storeHash, accessToken } = connection;

        try {

            const response = await axios({
                method: 'GET',
                url: `https://api.bigcommerce.com/stores/${storeHash}/v2/orders?customer_id=${customerId}`,
                headers: {
                    'Accept': 'application/json',
                    'X-Auth-Token': accessToken
                }
            });

            if (response?.data[0]?.id) {
                const onOrdersChild = childConfigs.find(child => child.type === "onOrders");
                api.setNextNode(onOrdersChild.id);
            } else {
                const onNoOrdersChild = childConfigs.find(child => child.type === "onNoOrders");
                api.setNextNode(onNoOrdersChild.id);
            }

            if (storeLocation === 'context') {
                api.addToContext(contextKey, response?.data, 'simple');
            } else {
                // @ts-ignore
                api.addToInput(inputKey, response?.data);
            }

        } catch (error) {
            api.log('error', error.message);
            const onNoOrdersChild = childConfigs.find(child => child.type === "onNoOrders");
            api.setNextNode(onNoOrdersChild.id);
        }
    }
});

export const onOrders = createNodeDescriptor({
    type: "onOrders",
    parentType: "getCustomerOrders",
    defaultLabel: {
        default: "Orders"
    },
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
        variant: "mini"
    }
});

export const onNoOrders = createNodeDescriptor({
    type: "onNoOrders",
    parentType: "getCustomerOrders",
    defaultLabel: {
        default: "No Orders"
    },
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
        variant: "mini"
    }
});