import { createNodeDescriptor, INodeFunctionBaseParams } from '@cognigy/extension-tools';
import axios from 'axios';

// Import authentication method for API requests
import { authenticate } from '../helper/authenticate';

export interface ITrackShipmentParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            serverUrl: string;
            clientId: string;
            clientSecret: string;
        };
        trackingNumber: string;
        storeLocation: string;
        contextKey: string;
        inputKey: string;
    };
}

export const trackShipmentNode = createNodeDescriptor({
    type: 'trackShipment',
    defaultLabel: {
        default: 'Track Shipment',
        deDE: 'Lieferung verfolgen'
    },
    summary: {
        default: 'Tracks an existing shipment based on the tracking number',
        deDE: 'Verfolgt eine existierende Lieferung auf Grundlage der Sendungsnummer',
    },
    fields: [
        {
            key: 'connection',
            label: {
                default: 'GLS Auth'
            },
            type: 'connection',
            params: {
                connectionType: 'gls',
                required: true
            }
        },
        {
            key: 'trackingNumber',
            label: {
                default: 'Tracking Number',
                deDE: 'Sendungsnummer'
            },
            description: {
                default: 'The reference number of the tracking',
                deDE: 'Die Referenznummer der Lieferung oder Sendung',
            },
            type: 'cognigyText',
            params: {
                required: true
            }
        },
        {
            key: 'storeLocation',
            type: 'select',
            label: {
                default: 'Where to store the result',
                deDE: 'Wo das Ergebnis gespeichert werden soll'
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
                default: 'Input Key to store Result',
                deDE: 'Input Key zum Speichern des Ergebnisses'
            },
            defaultValue: 'fedex.shipment',
            condition: {
                key: 'storeLocation',
                value: 'input',
            }
        },
        {
            key: 'contextKey',
            type: 'cognigyText',
            label: {
                default: 'Context Key to store Result',
                deDE: 'Context Key zum Speichern des Ergebnisses'
            },
            defaultValue: 'fedex.shipment',
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
                default: 'Storage Option',
                deDE: 'Speicheroption'
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
        { type: 'field', key: 'trackingNumber' },
        { type: 'section', key: 'storage' }
    ],
    appearance: {
        color: '#061ab1'
    },
    dependencies: {
        children: [
            'onFoundShipment',
            'onNotFoundShipment'
        ]
    },
    function: async ({ cognigy, config, childConfigs }: ITrackShipmentParams) => {
        const { api } = cognigy;
        const { connection, trackingNumber, storeLocation, contextKey, inputKey } = config;
        const { serverUrl, clientId, clientSecret } = connection;

        try {

            const oauthResponse = await authenticate(serverUrl, clientId, clientSecret);

            const response = await axios({
                method: 'POST',
                url: `${serverUrl}/gls-partner-portal/v1/tracking/details`,
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${oauthResponse?.access_token}`
                },
                data: {
                    'ParcelNo': trackingNumber
                }
            });

            if (storeLocation === 'context') {
                api.addToContext(contextKey, response?.data?.Delivery, 'simple');
            } else {
                // @ts-ignore
                api.addToInput(inputKey, response?.data?.Delivery);
            }

            if (response?.data?.Delivery) {
                const onFoundChild = childConfigs.find(child => child.type === 'onFoundShipment');
                api.setNextNode(onFoundChild.id);
            } else {
                const onNotFoundChild = childConfigs.find(child => child.type === 'onNotFoundShipment');
                api.setNextNode(onNotFoundChild.id);
            }

        } catch (error) {
            api.log('error', error.message);
            const onNotFoundChild = childConfigs.find(child => child.type === 'onNotFoundShipment');
            api.setNextNode(onNotFoundChild.id);
        }
    }
});

export const onFoundShipment = createNodeDescriptor({
    type: 'onFoundShipment',
    parentType: 'trackShipment',
    defaultLabel: {
        default: 'On Found',
        deDE: 'Gefunden',
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
        color: '#FFD101',
        textColor: 'white',
        variant: 'mini'
    }
});

export const onNotFoundShipment = createNodeDescriptor({
    type: 'onNotFoundShipment',
    parentType: 'trackShipment',
    defaultLabel: {
        default: 'On Not Found',
        deDE: 'Nicht gefunden'
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
        color: '#FFD101',
        textColor: 'white',
        variant: 'mini'
    }
});