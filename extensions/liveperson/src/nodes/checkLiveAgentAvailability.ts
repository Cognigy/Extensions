import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from "axios";

interface ILivePersonSkill {
    skillId: string;
    onShift: boolean;
    nextOn: any;
    nextOff: any;
}

interface ILivepersonSkill {
    deleted: boolean;
    name: string;
    id: number;
}

export interface IGetShiftStatusParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            username: string;
            appKey: string;
            secret: string;
            accountId: string;
            accessToken: string;
            accessTokenSecret: string;
        };
        skillId: string;
        storeLocation: string;
        contextKey: string;
        inputKey: string;
    };
}
export const checkLiveAgentAvailabilityNode = createNodeDescriptor({
    type: "checkLiveAgentAvailability",
    defaultLabel: {
        default: "Check Agent Availability",
        deDE: "Überprüfe Agenten Verfügbarkeit"
    },
    summary: {
        default: "Checks if an agent is available in Zendesk Chat",
        deDE: "Überprüft ob ein Agent in Liveperson verfügbar ist"
    },
    fields: [
        {
            key: "connection",
            label: {
                default: "Liveperson Connection",
                deDE: "Liveperson Verbindung",
            },
            type: "connection",
            params: {
                connectionType: "liveperson",
                required: true
            }
        },
        {
            key: "skillId",
            label: {
                default: "Skill Name",
                deDE: "Skill Name"
            },
            description: {
                default: "The name of the skill",
                deDE: "Der Name des Skills",
            },
            type: "select",
            params: {
                required: true,
            },
            optionsResolver: {
                dependencies: ["connection"],
                resolverFunction: async ({ api, config }) => {
                    try {

                        const { username, appKey, secret, accessToken, accessTokenSecret, accountId } = config.connection;

                        // First login to be authenticated
                        const authResponse = await api.httpRequest({
                            method: "POST",
                            url: `https://lo.agentvep.liveperson.net/api/account/${accountId}/login?v=1.3`,
                            headers: {
                                "Accept": "application/json",
                                "Content-Type": "application/json"
                            },
                            data: {
                                username,
                                appKey,
                                secret,
                                accessToken,
                                accessTokenSecret
                            }
                        });

                        const skillsResponse = await api.httpRequest({
                            method: "GET",
                            url: `https://lo.ac.liveperson.net/api/account/${accountId}/configuration/le-users/skills`,
                            headers: {
                                "Accept": "application/json",
                                "Authorization": `Bearer ${authResponse?.data?.bearer}`
                            }
                        });

                        // map file list to "options array"
                        return skillsResponse?.data?.map((skill: ILivepersonSkill) => {
                            return {
                                label: skill?.name,
                                value: skill?.id?.toString(),
                            };
                        });
                    } catch (error) {
                        throw new Error(error);
                    }
                }
            }
        },
        {
            key: "storeLocation",
            type: "select",
            label: {
                default: "Where to store the result",
                deDE: "Wo das Ergebnis gespeichert werden soll"
            },
            defaultValue: "input",
            params: {
                options: [
                    {
                        label: "Input",
                        value: "input"
                    },
                    {
                        label: "Context",
                        value: "context"
                    }
                ],
                required: true
            },
        },
        {
            key: "inputKey",
            type: "cognigyText",
            label: {
                default: "Input Key to store result",
                deDE: "Input Key zum Speichern des Ergebnisses"
            },
            defaultValue: "liveperson.liveAgentAvailability",
            condition: {
                key: "storeLocation",
                value: "input",
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: {
                default: "Context Key to store result",
                deDE: "Context Key zum Speichern des Ergebnisses"
            },
            defaultValue: "liveperson.liveAgentAvailability",
            condition: {
                key: "storeLocation",
                value: "context",
            }
        },
    ],
    sections: [
        {
            key: "storage",
            label: {
                default: "Storage Option",
                deDE: "Speicheroption"
            },
            defaultCollapsed: true,
            fields: [
                "storeLocation",
                "inputKey",
                "contextKey",
            ]
        }
    ],
    form: [
        { type: "field", key: "connection" },
        { type: "field", key: "skillId" },
        { type: "section", key: "storage" },
    ],
    appearance: {
        color: "orange"
    },
    dependencies: {
        children: [
            "onAgentAvailable",
            "onNoAgentAvailable"
        ]
    },
    function: async ({ cognigy, config, childConfigs }: IGetShiftStatusParams) => {
        const { api } = cognigy;
        const { connection, skillId, storeLocation, contextKey, inputKey } = config;
        const { username, appKey, secret, accessToken, accountId, accessTokenSecret } = connection;

        try {

            // First login to be authenticated
            const authResponse = await axios({
                method: "post",
                url: `https://lo.agentvep.liveperson.net/api/account/${accountId}/login?v=1.3`,
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                data: {
                    username,
                    appKey,
                    secret,
                    accessToken,
                    accessTokenSecret
                }
            });

            // Get the all skills and their status
            const response = await axios({
                method: "get",
                url: `https://lo.msg.liveperson.net/api/account/${accountId}/shift-status`,
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authResponse?.data?.bearer}`
                }
            });

            api.log('info', `Checking agent availability for skill with ID: ${skillId}`);

            let isAvailable: boolean = false;

            // Loop through all skills and check the shift of the configured one
            let skills: ILivePersonSkill[] = response?.data;
            for (let skill of skills) {
                api.log('debug', `Skill: ${JSON.stringify(skill)} (${typeof skill?.skillId})`);
                if (skill?.skillId === skillId && skill?.onShift) {
                    isAvailable = true;
                } else {
                    isAvailable = false;
                }
            }

            if (isAvailable) {
                const onAvailableChild = childConfigs.find(child => child.type === "onAgentAvailable");
                api.setNextNode(onAvailableChild.id);
            } else if (!isAvailable) {
                const onOfflineChild = childConfigs.find(child => child.type === "onNoAgentAvailable");
                api.setNextNode(onOfflineChild.id);
            }

        } catch (error) {

            const onOfflineChild = childConfigs.find(child => child.type === "onNoAgentAvailable");
            api.setNextNode(onOfflineChild.id);

            if (storeLocation === "context") {
                api.addToContext(contextKey, { error: error }, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, { error: error });
            }
        }
    }
});

export const onAgentAvailable = createNodeDescriptor({
    type: "onAgentAvailable",
    parentType: "checkLiveAgentAvailability",
    defaultLabel: {
        default: "On Online",
        deDE: "Ist Online"
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

export const onNoAgentAvailable = createNodeDescriptor({
    type: "onNoAgentAvailable",
    parentType: "checkLiveAgentAvailability",
    defaultLabel: {
        default: "On Offline",
        deDE: "Ist Offline"
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