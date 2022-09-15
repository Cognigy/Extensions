import { createNodeDescriptor, INodeFunctionBaseParams } from '@cognigy/extension-tools';
import axios from 'axios';

export interface IGetTasksByUserParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            personalAccessToken: string
        };
        workspaceId: string;
        userId: string;
        storeLocation: string;
        contextKey: string;
        inputKey: string;
    };
}

export interface IAsanaWorkspace {
    gid: string;
    name: string;
    resource_type: string;
}

export interface IAsanaUser {
    gid: string;
    name: string;
    resource_type: string;
}

export const getTicketsByUserNode = createNodeDescriptor({
    type: 'getTicketsByUser',
    defaultLabel: {
        default: 'Get User Tasks',
        deDE: 'Erhalte Nutzeraufgaben'
    },
    summary: {
        default: 'Retrievs information about user tasks',
        deDE: 'Ruft Informationen zu Nutzerufgaben ab',
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
            key: "workspaceId",
            label: {
                default: "Workspace",
                deDE: "Workspace"
            },
            description: {
                default: "The ID of the Asana workspace",
                deDE: "Die ID des Asana Workspaces",
            },
            type: "select",
            params: {
                required: true,
            },
            optionsResolver: {
                dependencies: ["connection"],
                resolverFunction: async ({ api, config }) => {
                    try {
                        const workspacesResponse = await api.httpRequest({
                            method: 'get',
                            url: `https://app.asana.com/api/1.0/workspaces`,
                            headers: {
                                "Accept": "application/json",
                                "Authorization": `Bearer ${config?.connection?.personalAccessToken}`
                            }
                        });

                        // map file list to "options array"
                        return workspacesResponse?.data?.data?.map((workspace: IAsanaWorkspace) => {
                            return {
                                label: workspace?.name,
                                value: workspace?.gid,
                            };
                        });
                    } catch (error) {
                        throw new Error(error);
                    }
                }
            }
        },
        {
            key: 'userId',
            label: {
                default: 'User ID',
                deDE: 'Nutzer ID'
            },
            description: {
                default: 'The reference id of the user',
                deDE: 'Die Referenznummer der Nutzer:in',
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
            defaultValue: 'asana.tasks',
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
            defaultValue: 'asana.tasks',
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
        { type: 'field', key: 'workspaceId' },
        { type: 'field', key: 'userId' },
        { type: 'section', key: 'storage' }
    ],
    appearance: {
        color: '#F95A7A'
    },
    dependencies: {
        children: [
            'onUserTasks',
            'onNoUserTasks'
        ]
    },
    function: async ({ cognigy, config, childConfigs }: IGetTasksByUserParams) => {
        const { api } = cognigy;
        const { connection, workspaceId, userId, storeLocation, contextKey, inputKey } = config;
        const { personalAccessToken } = connection;

        try {

            const response = await axios({
                method: 'get',
                url: `https://app.asana.com/api/1.0/tasks?assignee=${userId}&workspace=${workspaceId}`,
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

            if (response?.data?.data[0]?.gid) {
                const OnUserTasksChild = childConfigs.find(child => child.type === 'onUserTasks');
                api.setNextNode(OnUserTasksChild.id);
            } else {
                const onNoUserTasksChild = childConfigs.find(child => child.type === 'onNoUserTasks');
                api.setNextNode(onNoUserTasksChild.id);
            }

        } catch (error) {
            api.log('error', error.message);
            const onNoUserTasksChild = childConfigs.find(child => child.type === 'onNoUserTasks');
            api.setNextNode(onNoUserTasksChild.id);
        }
    }
});


export const onUserTasks = createNodeDescriptor({
    type: 'onUserTasks',
    parentType: 'getTicketsByUser',
    defaultLabel: {
        default: 'Has Tasks',
        deDE: 'Hat Aufgaben',
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

export const onNoUserTasks = createNodeDescriptor({
    type: 'onNoUserTasks',
    parentType: 'getTicketsByUser',
    defaultLabel: {
        default: 'Has No Tasks',
        deDE: 'Hat keine Aufgaben'
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