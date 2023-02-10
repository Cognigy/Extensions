import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from "axios";

export interface IShortenUrlParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            accessToken: string;
            organizationId: string;
        };
        groupId: string;
        url: string;
        storeLocation: string;
        contextKey: string;
        inputKey: string;
    };
}

interface IBitlyGroup {
    created: string;
    modified: string;
    bsds: any[];
    guid: string;
    organization_guid: string;
    name: string;
    is_active: boolean;
    role: string;
    references: {
        organization: string;
    };
}

export const shortenUrlNode = createNodeDescriptor({
    type: "shortenUrl",
    defaultLabel: {
        default: "Shorten URL",
        deDE: "URL kürzen"
    },
    summary: {
        default: "Shortens a long URL to a bitly link",
        deDE: "Kürzt eine lange URL in eine bitly URL",
    },
    fields: [
        {
            key: "connection",
            label: {
                default: "Bitly Authentication"
            },
            type: "connection",
            params: {
                connectionType: "bitly",
                required: true
            }
        },
        {
            key: "groupId",
            label: {
                default: "Group",
                deDE: "Gruppe"
            },
            description: {
                default: "The bitly group that should be used",
                deDE: "Die zu verwendende bitly Gruppe",
            },
            type: "select",
            params: {
                required: true,
            },
            optionsResolver: {
                dependencies: ["connection"],
                resolverFunction: async ({ api, config }) => {
                    try {
                        const projectsResponse = await api.httpRequest({
                            method: "GET",
                            url: `https://api-ssl.bitly.com/v4/groups?organization_guid=${config.connection.organizationId}`,
                            headers: {
                                "Accept": "application/json",
                                "Authorization": `Bearer ${config.connection.accessToken}`
                            }
                        });

                        // map file list to "options array"
                        return projectsResponse?.data?.data?.map((group: IBitlyGroup) => {
                            if (group?.is_active) {
                                return {
                                    label: group?.name,
                                    value: group.guid,
                                };
                            }
                        });
                    } catch (error) {
                        throw new Error(error);
                    }
                }
            }
        },
        {
            key: "url",
            label: {
                default: "URL",
                deDE: "URL"
            },
            description: {
                default: "The long URL that should be shortened",
                deDE: "Die lange URL welche gekürzt werden soll",
            },
            type: "cognigyText",
            params: {
                required: true
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
                default: "Input Key to store Result",
                deDE: "Input Key zum Speichern des Ergebnisses"
            },
            defaultValue: "bitly",
            condition: {
                key: "storeLocation",
                value: "input",
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: {
                default: "Context Key to store Result",
                deDE: "Context Key zum Speichern des Ergebnisses"
            },
            defaultValue: "bitly",
            condition: {
                key: "storeLocation",
                value: "context",
            }
        }
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
                "contextKey"
            ]
        }
    ],
    form: [
        { type: "field", key: "connection" },
        { type: "field", key: "groupId" },
        { type: "field", key: "url" },
        { type: "section", key: "storage" }
    ],
    appearance: {
        color: "#ee6123"
    },
    dependencies: {
        children: [
            "onSuccessShorten",
            "onErrorShorten"
        ]
    },
    function: async ({ cognigy, config, childConfigs }: IShortenUrlParams) => {
        const { api } = cognigy;
        const { connection, groupId, url, storeLocation, contextKey, inputKey } = config;
        const { accessToken } = connection;

        try {

            const response = await axios({
                method: "POST",
                url: `https://api-ssl.bitly.com/v4/shorten`,
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`
                },
                data: {
                    group_guid: groupId,
                    domain: "bit.ly",
                    long_url: url
                }
            });

            if (storeLocation === "context") {
                api.addToContext(contextKey, response.data, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, response.data);
            }

            const onSuccessChild = childConfigs.find(child => child.type === "onSuccessShorten");
            api.setNextNode(onSuccessChild.id);
        } catch (error) {
            const onErrorChild = childConfigs.find(child => child.type === "onErrorShorten");
            api.setNextNode(onErrorChild.id);
            api.log("error", error.message);
        }
    }
});


export const onSuccessShorten = createNodeDescriptor({
    type: "onSuccessShorten",
    parentType: "shortenUrl",
    defaultLabel: {
        default: "On Success",
        deDE: "Erfolgreich",
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

export const onErrorShorten = createNodeDescriptor({
    type: "onErrorShorten",
    parentType: "shortenUrl",
    defaultLabel: {
        default: "On Error",
        deDE: "Fehlerhaft"
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
        color: "red",
        textColor: "white",
        variant: "mini"
    }
});