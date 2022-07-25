import { createNodeDescriptor, INodeFunctionBaseParams } from '@cognigy/extension-tools';
import axios from 'axios';

export interface IGetTaskByIdParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            personalAccessToken: string
        };
        taskId: string;
        filter: string;
        storeLocation: string;
        contextKey: string;
        inputKey: string;
    };
}

export const getTicketByIdNode = createNodeDescriptor({
    type: 'getTicketById',
    defaultLabel: {
        default: 'Get Task',
        deDE: 'Erhalte Ticket'
    },
    summary: {
        default: 'Retrievs information about a task based on a given ID',
        deDE: 'Ruft Informationen zu einer Aufgabe basierend auf einer bestimmten ID ab',
    },
    fields: [
        {
            key: 'connection',
            label: {
                default: 'Personal Access Token'
            },
            type: 'connection',
            params: {
                connectionType: 'asana-pat',
                required: true
            }
        },
        {
            key: 'taskId',
            label: {
                default: 'Task ID',
                deDE: 'ID der Aufgabe'
            },
            description: {
                default: 'The reference id of the task',
                deDE: 'Die Referenznummer der Aufgabe',
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
            defaultValue: 'asana.task',
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
            defaultValue: 'asana.task',
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
        { type: 'field', key: 'taskId' },
        { type: 'section', key: 'storage' }
    ],
    appearance: {
        color: '#F95A7A'
    },
    dependencies: {
        children: [
            'onFoundTicket',
            'onNotFoundTicket'
        ]
    },
    function: async ({ cognigy, config, childConfigs }: IGetTaskByIdParams) => {
        const { api } = cognigy;
        const { connection, taskId, storeLocation, contextKey, inputKey } = config;
        const { personalAccessToken } = connection;

        try {

            const response = await axios({
                method: 'GET',
                url: `https://app.asana.com/api/1.0/tasks/${taskId}`,
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${personalAccessToken}`
                }
            });

            if (storeLocation === 'context') {
                api.addToContext(contextKey, response?.data?.data, 'simple');
            } else {
                // @ts-ignore
                api.addToInput(inputKey, response?.data?.data);
            }

            if (response?.data?.data?.gid) {
                const onFoundChild = childConfigs.find(child => child.type === 'onFoundTicket');
                api.setNextNode(onFoundChild.id);
            } else {
                const onNotFoundChild = childConfigs.find(child => child.type === 'onNotFoundTicket');
                api.setNextNode(onNotFoundChild.id);
            }

        } catch (error) {
            api.log('error', error.message);
            const onNotFoundChild = childConfigs.find(child => child.type === 'onNotFoundTicket');
            api.setNextNode(onNotFoundChild.id);
        }
    }
});

export const onFoundTicket = createNodeDescriptor({
    type: 'onFoundTicket',
    parentType: 'getTicketById',
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
        color: '#61d188',
        textColor: 'white',
        variant: 'mini'
    }
});

export const onNotFoundTicket = createNodeDescriptor({
    type: 'onNotFoundTicket',
    parentType: 'getTicketById',
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
        color: '#cf142b',
        textColor: 'white',
        variant: 'mini'
    }
});