import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from "axios";
import * as uuid from 'uuid';
import * as crypto from 'crypto';


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
        connection2: {
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
                default: "Liveperson Connection OnShift API",
                deDE: "Liveperson Verbindung OnShift API",
            },
            type: "connection",
            params: {
                connectionType: "liveperson",
                required: true
            }
        },
        {
            key: "connection2",
            label: {
                default: "Liveperson Connection Agent Status API",
                deDE: "Liveperson Verbindung Agent Status API",
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
        { type: "field", key: "connection2" },
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
        const { api, context } = cognigy;
        const { connection, connection2, skillId, storeLocation, contextKey, inputKey } = config;
        const { username, appKey, secret, accessToken, accountId, accessTokenSecret } = connection;

        try {
            let authToken;

            // Check if login token already available
            if (context.livepersonBearerToken) {
                api.log("debug", "login token present");
                authToken = context.livepersonBearerToken;
            } else {
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
                authToken = authResponse?.data?.bearer;
            }

            // Get the all skills and their shift status
            const response = await axios({
                method: "get",
                url: `https://lo.msg.liveperson.net/api/account/${accountId}/shift-status`,
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authToken}`
                }
            });

            let isAvailable: boolean = false;

            // Loop through all skills and check the shift of the configured one
            let skills: ILivePersonSkill[] = response?.data;
            // api.log('debug', 'Skills response for ID ' + skillId + ': ' + JSON.stringify(skills));
            for (let skill of skills) {
                if ((skill?.skillId === skillId) && skill?.onShift) {
                    isAvailable = true;
                }
            }
            if (isAvailable) {
                try {
                    // limit=1 is hardcoded both in parameters and in axios request
                    // build oauth 1.0 authentication signature
                    // based on https://oauth.net/core/1.0/#RFC2104
                    const httpMethod = 'POST',
                        url = "https://lo.msghist.liveperson.net/messaging_history/api/account/" + connection2.accountId + "/agent-view/status",
                        parameters = {
                            limit: 1,
                            oauth_consumer_key: connection2.appKey,
                            oauth_token: connection2.accessToken,
                            oauth_nonce: uuid.v1(), // "bvFVqnP8oAo",
                            oauth_timestamp: Math.floor(new Date().valueOf() / 1000), // 1668593517,
                            oauth_signature_method: 'HMAC-SHA1',
                            oauth_version: '1.0'
                        },
                        consumerSecret = connection2.secret,
                        tokenSecret = connection2.accessTokenSecret;
                    // lexicographically sorted parameters, separated by &
                    const parameterString = "limit=1&oauth_consumer_key=" + connection2.appKey + "&oauth_nonce=" + parameters.oauth_nonce + "&oauth_signature_method=HMAC-SHA1&oauth_timestamp=" + parameters.oauth_timestamp + "&oauth_token=" + connection2.accessToken + "&oauth_version=1.0";
                    // httpMethod needs to be uppercase, url needs to be lowercase
                    const signatureBaseString = httpMethod + "&" + encodeURIComponent(url) + "&" + encodeURIComponent(parameterString);
                    const keyString = consumerSecret + "&" + tokenSecret;
                    const encodedSignature = encodeURIComponent(
                        crypto.createHmac("SHA1", keyString)
                            .update(signatureBaseString)
                            .digest()
                            .toString('base64')
                    );

                    const response2 = await axios({
                        method: 'POST',
                        url: url + "?limit=1",
                        headers: {
                            "Accept": "application/json",
                            "Content-Type": "application/json",
                            "Authorization": 'OAuth oauth_signature="' + encodedSignature + '",oauth_version="1.0",oauth_nonce="' + parameters.oauth_nonce + '",oauth_consumer_key="' + parameters.oauth_consumer_key + '",oauth_signature_method="HMAC-SHA1",oauth_token="' + parameters.oauth_token + '",oauth_timestamp="' + parameters.oauth_timestamp + '"'
                        },
                        data: {
                            "skillIds": [skillId],
                            "status": ["ONLINE"]
                        }
                    });

                    // api.log('debug', 'Agent status response for ID ' + skillId + ': ' + JSON.stringify(response2?.data?.agentStatusRecords));
                    if (!response2?.data?.agentStatusRecords?.length) {
                        // agent unavailable
                        isAvailable = false;
                    }
                } catch (error) {
                    api.log('error', 'Agent status failed: ' + JSON.stringify(error));
                }
            }
            /*
            // Check actual agent availability
            // if (true) {
            // }
            */

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