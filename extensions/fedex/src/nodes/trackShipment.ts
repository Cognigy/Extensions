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
        includeDetailedScans: boolean;
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
                default: 'FedEx OAuth'
            },
            type: 'connection',
            params: {
                connectionType: 'fedex',
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
            key: 'includeDetailedScans',
            label: {
                default: 'Include Detailed Scans',
                deDE: 'Detallierte Scans einfügen'
            },
            description: {
                default: 'Indicates if detailed scans are requested or not',
                deDE: 'Gibt an, ob detaillierte Scans angefordert werden oder nicht'
            },
            defaultValue: true,
            type: 'toggle'
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
        },
        {
            key: 'advanced',
            label: {
                default: 'Advanced',
                deDE: 'Erweitert'
            },
            defaultCollapsed: true,
            fields: [
                'includeDetailedScans'
            ]
        }
    ],
    form: [
        { type: 'field', key: 'connection' },
        { type: 'field', key: 'trackingNumber' },
        { type: 'section', key: 'advanced' },
        { type: 'section', key: 'storage' }
    ],
    appearance: {
        color: '#FF6600'
    },
    dependencies: {
        children: [
            'onFoundShipment',
            'onNotFoundShipment'
        ]
    },
    function: async ({ cognigy, config, childConfigs }: ITrackShipmentParams) => {
        const { api } = cognigy;
        const { connection, trackingNumber, includeDetailedScans, storeLocation, contextKey, inputKey } = config;
        const { serverUrl, clientId, clientSecret } = connection;

        try {

            const oauthResponse = await authenticate(serverUrl, clientId, clientSecret);

            const response = await axios({
                method: 'POST',
                url: `${serverUrl}/track/v1/trackingnumbers`,
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${oauthResponse?.access_token}`
                },
                data: {
                    'trackingInfo': [
                      {
                        'trackingNumberInfo': {
                          'trackingNumber': trackingNumber
                        }
                      }
                    ],
                    'includeDetailedScans': includeDetailedScans
                  }
            });

            if (storeLocation === 'context') {
                api.addToContext(contextKey, response.data?.output?.completeTrackResults[0]?.trackResults, 'simple');
            } else {
                // @ts-ignore
                api.addToInput(inputKey, response.data?.output?.completeTrackResults[0]?.trackResults);
            }

            if (response.data?.output?.completeTrackResults?.trackResults[0]?.error?.code !== 'TRACKING.TRACKINGNUMBER.NOTFOUND') {
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
        color: '#4D148C',
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
        color: '#4D148C',
        textColor: 'white',
        variant: 'mini'
    }
});