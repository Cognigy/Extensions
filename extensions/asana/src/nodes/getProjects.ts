import { createNodeDescriptor, INodeFunctionBaseParams } from '@cognigy/extension-tools';
import axios from 'axios';

export interface IGetProjectsParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            personalAccessToken: string
        };
        workspaceId: string;
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

export const getProjectsNode = createNodeDescriptor({
    type: 'getProjects',
    defaultLabel: {
        default: 'Get Projects',
        deDE: 'Erhalte Alle Projekte'
    },
    summary: {
        default: 'Retrievs all projects from Asana',
        deDE: 'Ruft alle Projekte ab',
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
            defaultValue: '',
            params: {
                required: false,
            },
            optionsResolver: {
                dependencies: ["connection"],
                resolverFunction: async ({ api, config }) => {
                    try {
                        const workspacesResponse = await api.httpRequest({
                            method: 'get',
                            url:  `https://app.asana.com/api/1.0/workspaces`,
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
            defaultValue: 'asana.projects',
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
            defaultValue: 'asana.projects',
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
                'workspaceId'
            ]
        }
    ],
    form: [
        { type: 'field', key: 'connection' },
        { type: 'section', key: 'advanced' },
        { type: 'section', key: 'storage' }
    ],
    appearance: {
        color: '#F95A7A'
    },
    function: async ({ cognigy, config }: IGetProjectsParams) => {
        const { api } = cognigy;
        const { connection, workspaceId, storeLocation, contextKey, inputKey } = config;
        const { personalAccessToken } = connection;

        try {

            let url: string = '';
            if (workspaceId?.length !== 0) {
                url = `https://app.asana.com/api/1.0/projects?workspace=${workspaceId}`;
            } else {
                url = `https://app.asana.com/api/1.0/projects`;
            }

            const response = await axios({
                method: 'get',
                url,
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

        } catch (error) {
            api.log('error', error.message);
        }
    }
});