import { createNodeDescriptor, INodeFunctionBaseParams } from '@cognigy/extension-tools';
import axios from 'axios';

export interface IValidateCustomerParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            accessToken: string;
            storeHash: string;
        };
        email: string;
        password: string;
        channelId: string;
        storeLocation: string;
        contextKey: string;
        inputKey: string;
    };
}

interface IBigCommerceChannel {
    icon_url: string,
    is_listable_from_ui: boolean,
    is_visible: boolean,
    date_created: string,
    external_id: string,
    type: string,
    platform: string,
    is_enabled: boolean,
    date_modified: string,
    name: string,
    id: number,
    status: string
}

export const validateCustomerNode = createNodeDescriptor({
    type: 'validateCustomer',
    defaultLabel: {
        default: 'Validate Customer'
    },
    summary: {
        default: 'Validates a customer based on the username password and the channel'
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
            key: 'email',
            label: {
                default: 'Email Address'
            },
            description: 'The email address of the BigCommerce customer',
            type: 'cognigyText',
            params: {
                required: true
            }
        },
        {
            key: 'password',
            label: {
                default: 'Password'
            },
            description: 'The password of the BigCommerce customer',
            type: 'cognigyText',
            params: {
                required: true
            }
        },
        {
            key: 'channelId',
            label: {
                default: 'Channel'
            },
            description: {
                default: 'The channel that is used to validate or login'
            },
            type: 'select',
            params: {
                required: true
            },
            optionsResolver: {
                dependencies: ["connection"],
                resolverFunction: async ({ api, config }) => {
                    try {
                        const channelsResponse = await api.httpRequest({
                            method: "GET",
                            url: `https://api.bigcommerce.com/stores/${config.connection.storeHash}/v3/channels`,
                            headers: {
                                "Accept": "application/json",
                                "X-Auth-Token": config.connection.accessToken
                            }
                        });

                        // map file list to "options array"
                        return channelsResponse?.data?.data?.map((channel: IBigCommerceChannel) => {
                            return {
                                label: channel?.name,
                                value: channel?.id.toString(),
                            }
                        });
                    } catch (error) {
                        throw new Error(error);
                    }
                }
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
            defaultValue: 'bigcommerce.validation',
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
            defaultValue: 'bigcommerce.validation',
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
    tokens: [
        {
			label: "Customer ID",
			script: "input.bigcommerce.validation.customer_id",
			type: "input"
		},
    ],
    form: [
        { type: 'field', key: 'connection' },
        { type: 'field', key: 'email' },
        { type: 'field', key: 'password' },
        { type: 'field', key: 'channelId'},
        { type: 'section', key: 'storage' }
    ],
    appearance: {
        color: 'black'
    },
    dependencies: {
        children: [
            'onValid',
            'onInvalid'
        ]
    },
    function: async ({ cognigy, config, childConfigs }: IValidateCustomerParams) => {
        const { api } = cognigy;
        const { connection, email, password, channelId, storeLocation, contextKey, inputKey } = config;
        const { storeHash, accessToken } = connection;

        try {

            const response = await axios({
                method: 'POST',
                url: `https://api.bigcommerce.com/stores/${storeHash}/v3/customers/validate-credentials`,
                headers: {
                    'Accept': 'application/json',
                    'X-Auth-Token': accessToken
                },
                data: {
                    email,
                    password,
                    channel_id: parseInt(channelId)
                }
            });

            if (response?.data?.is_valid) {
                const onValidChild = childConfigs.find(child => child.type === "onValid");
                api.setNextNode(onValidChild.id);
            } else {
                const onInvalidChild = childConfigs.find(child => child.type === "onInvalid");
                api.setNextNode(onInvalidChild.id);
            }

            if (storeLocation === 'context') {
                api.addToContext(contextKey, response?.data, 'simple');
            } else {
                // @ts-ignore
                api.addToInput(inputKey, response?.data);
            }

        } catch (error) {
            api.log('error', error.message);
            const onInvalidChild = childConfigs.find(child => child.type === "onInvalid");
            api.setNextNode(onInvalidChild.id);
        }
    }
});

export const onValid = createNodeDescriptor({
    type: "onValid",
    parentType: "validateCustomer",
    defaultLabel: {
        default: "Valid"
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

export const onInvalid = createNodeDescriptor({
    type: "onInvalid",
    parentType: "validateCustomer",
    defaultLabel: {
        default: "Invalid"
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