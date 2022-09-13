import { createNodeDescriptor, INodeFunctionBaseParams } from '@cognigy/extension-tools';
import axios from 'axios';

export interface IGetOrderShipmentsParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            accessToken: string;
            storeHash: string;
        };
        orderId: number;
        storeLocation: string;
        contextKey: string;
        inputKey: string;
    };
}

export const getOrderShipmentsNode = createNodeDescriptor({
    type: 'getOrderShipmentsNode',
    defaultLabel: {
        default: 'Get Order Shipments'
    },
    summary: {
        default: 'Retrieves all shipments for a given order by id'
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
            key: 'orderId',
            label: {
                default: 'Ordre ID'
            },
            type: "cognigyText",
            description: {
                default: 'The ID of the order'
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
            defaultValue: 'bigcommerce.shipments',
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
            defaultValue: 'bigcommerce.shipments',
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
            'onShipments',
            'onNoShipments'
        ]
    },
    function: async ({ cognigy, config, childConfigs }: IGetOrderShipmentsParams) => {
        const { api } = cognigy;
        const { connection, orderId, storeLocation, contextKey, inputKey } = config;
        const { storeHash, accessToken } = connection;

        try {

            const response = await axios({
                method: 'GET',
                url: `https://api.bigcommerce.com/stores/${storeHash}/v2/orders/${orderId}/shipments`,
                headers: {
                    'Accept': 'application/json',
                    'X-Auth-Token': accessToken
                }
            });

            if (response?.data[0]?.id) {
                const onOrdersChild = childConfigs.find(child => child.type === "onShipments");
                api.setNextNode(onOrdersChild.id);
            } else {
                const onNoOrdersChild = childConfigs.find(child => child.type === "onNoShipments");
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
            const onNoOrdersChild = childConfigs.find(child => child.type === "onNoShipments");
            api.setNextNode(onNoOrdersChild.id);
        }
    }
});

export const onShipments = createNodeDescriptor({
    type: "onShipments",
    parentType: "getOrderShipmentsNode",
    defaultLabel: {
        default: "Shipments"
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

export const onNoShipments = createNodeDescriptor({
    type: "onNoShipments",
    parentType: "getOrderShipmentsNode",
    defaultLabel: {
        default: "No Shipments"
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