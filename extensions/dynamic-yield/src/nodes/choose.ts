import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from "axios";

export interface IChooseParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            key: string;
            region: string;
        };
        selectorNames: string[];
        contextPageType: string;
        contextPageLocation: string;
        useLexicon: boolean;
        conditions: any[];
        useLocale: boolean;
        useIPAddress: boolean;
        useDYID: boolean;
        dyID: string;
        useDYSession: boolean;
        dySession: string;
        advancedConditions: any[];
        logConditions: boolean;
        storeLocation: string;
        contextKey: string;
        inputKey: string;
    };
}

interface IDYUser {
    dyid?: string;
    dyid_server?: string;
}

interface IDYSession {
    dy?: string;
}

interface IDYDevice {
    ip?: string;
}

export const chooseNode = createNodeDescriptor({
    type: "choose",
    defaultLabel: {
        default: "Choose",
        deDE: "Auswählen"
    },
    summary: {
        default: "Get the chosen variations for one or more campaigns",
        deDE: "Erhalte die ausgewählten Variationen einer oder mehrerer Kampagnen"
    },
    fields: [
        {
            key: "connection",
            label: {
                default: "Dynamic Yield Connection",
                deDE: "Dynamic Yield Verbindung"
            },
            type: "connection",
            params: {
                connectionType: "dynamic-yield",
                required: true
            }
        },
        {
            key: "selectorNames",
            label: {
                default: "Selectors",
                deDE: "Begriffe"
            },
            type: "textArray",
            description: {
                default: "Array of Dynamic Yield campaign names to choose variations for.",
                deDE: "Array mit Namen von Dynamic Yield-Kampagnen, für die Variationen ausgewählt werden können."
            },
            params: {
                required: true
            }
        },
        {
            key: "contextPageType",
            label: {
                default: "Type",
                deDE: "Typ"
            },
            type: "select",
            defaultValue: "HOMEPAGE",
            params: {
                required: true,
                options: [
                    {
                        label: "Homepage",
                        value: "HOMEPAGE"
                    },
                    {
                        label: "Category",
                        value: "CATEGORY"
                    },
                    {
                        label: "Product",
                        value: "PRODUCT"
                    },
                    {
                        label: "Cart",
                        value: "CART"
                    }, {
                        label: "Other",
                        value: "OTHER"
                    }
                ],
            }
        },
        {
            key: "contextPageLocation",
            label: {
                default: "Page Location",
                deDE: "Webseite"
            },
            type: "cognigyText",
            description: {
                default: "The current page's location. URL (for web), location (for SPA), or screen name (for mobile apps). Enables targeting the current page.",
                deDE: "Der Standort der aktuellen Seite. URL (für Web), Standort (für SPA) oder Bildschirmname (für mobile Anwendungen). Ermöglicht die Ausrichtung auf die aktuelle Seite."
            },
            params: {
                required: true
            }
        },
        {
            key: "useLexicon",
            label: {
                default: "Use Lexicon",
                deDE: "Lexicon verwenden"
            },
            type: "toggle",
            defaultValue: false,
            description: {
                default: "If a Cognigy Lexicon should be used to detect slots and keyphrases that are used as conditions.",
                deDE: "Ob ein Cognigy Lexicon für die Erkennung von Slots und Keyphrases genutzt werden soll. Diese werden als Conditions genutzt"
            }
        },
        {
            key: "conditions",
            label: {
                default: "Conditions",
                deDE: "Bedingungen"
            },
            description: {
                default: "Conditions that should be used for choosing products.",
                deDE: "Bedingungen die für die Produktauswahl genutzt werden sollen."
            },
            type: "json",
            defaultValue: `[{
                "field": "price",
                "arguments": [
                   {
                      "action": "LT",
                      "value": 40
                   }
                ]
             }]`,
            condition: {
                key: "useLexicon",
                value: false
            }
        },
        {
            key: "advancedConditions",
            label: {
                default: "Advanced Conditions",
                deDE: "Erweiterte Bedingungen"
            },
            description: {
                default: "More advanced conditions that should be used for choosing products. The standard uses the IS action.",
                deDE: "Erweiterte Bedingungen die zur Produktauswahl genutzt werden sollen."
            },
            type: "json",
            defaultValue: "[]",
            condition: {
                key: "useLexicon",
                value: true
            }
        },
        {
            key: "logConditions",
            label: {
                default: "Log Conditions",
                deDE: "Bedingungen loggen"
            },
            description: {
                default: "Logs the filter conditions as debug message.",
                deDE: "Schreibt die Filterbedingungen als Debugnachricht in die Logs."
            },
            type: "toggle",
            defaultValue: false,
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
            defaultValue: "products",
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
            defaultValue: "products",
            condition: {
                key: "storeLocation",
                value: "context",
            }
        },
        {
            key: "useLocale",
            label: {
                default: "Use Locale",
                deDE: "Standort verwenden"
            },
            description: {
                default: "If the user locale should be used, such as de_DE or en_US etc. for affinity.",
                deDE: "Ob das Benutzergebietsschema verwendet werden soll, z. B. de_DE oder en_US usw. für die Affinität."
            },
            type: "toggle",
            defaultValue: false
        },
        {
            key: "useIPAddress",
            label: {
                default: "Use IP Address",
                deDE: "IP Adresse verwenden"
            },
            description: {
                default: "If the ip address of the user should be used for affinity.",
                deDE: "Ob die IP Adresse der Nutzerin für die Affinität verwendet werden soll."
            },
            type: "toggle",
            defaultValue: false
        },
        {
            key: "useDYSession",
            label: {
                default: "Use Dynamic Yield Session",
                deDE: "Dynamic Yield Session verwenden"
            },
            description: {
                default: "If the Dynamic Yield session should be used for affinity.",
                deDE: "Ob die Dynamic Yield Session für die Affinität verwendet werden soll."
            },
            type: "toggle",
            defaultValue: false
        },
        {
            key: "dySession",
            label: {
                default: "Dynamic Yield Session",
                deDE: "Dynamic Yield Session"
            },
            type: "cognigyText",
            condition: {
                key: "useDYSession",
                value: true,
            }
        },
        {
            key: "useDYID",
            label: {
                default: "Use Dynamic Yield ID",
                deDE: "Dynamic Yield ID verwenden"
            },
            description: {
                default: "If the Dynamic Yield id should be used for affinity.",
                deDE: "Ob die Dynamic Yield ID für die Affinität verwendet werden soll."
            },
            type: "toggle",
            defaultValue: false
        },
        {
            key: "dyID",
            label: {
                default: "Dynamic Yield ID",
                deDE: "Dynamic Yield ID"
            },
            type: "cognigyText",
            condition: {
                key: "useDYID",
                value: true,
            }
        }
    ],
    sections: [
        {
            key: "conditionsOptions",
            label: {
                default: "Conditions Option",
                deDE: "Bedingungenoption"
            },
            defaultCollapsed: true,
            fields: [
                "useLexicon",
                "conditions",
                "advancedConditions"
            ]
        },
        {
            key: "affinityOptions",
            label: {
                default: "Affinity Option",
                deDE: "Affinitätenoption"
            },
            defaultCollapsed: true,
            fields: [
                "useLocale",
                "useIPAddress",
                "useDYID",
                "dyID",
                "useDYSession",
                "dySession"
            ]
        },
        {
            key: "debuggingOptions",
            label: {
                default: "Debugging",
                deDE: "Fehlersuche"
            },
            defaultCollapsed: true,
            fields: [
                "logConditions"
            ]
        },
        {
            key: "storageOptions",
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
        { type: "field", key: "selectorNames" },
        { type: "field", key: "contextPageType" },
        { type: "field", key: "contextPageLocation" },
        { type: "section", key: "conditionsOptions" },
        { type: "section", key: "affinityOptions" },
        { type: "section", key: "storageOptions" },
        { type: "section", key: "debuggingOptions" }
    ],
    appearance: {
        color: "#E60887"
    },
    dependencies: {
        children: [
            "onFound",
            "onNotFound"
        ]
    },
    function: async ({ cognigy, config, childConfigs }: IChooseParams) => {
        const { api, input } = cognigy;
        let { selectorNames, contextPageLocation, contextPageType, useLexicon, useLocale, useDYID, useDYSession, useIPAddress, dyID, dySession, conditions, logConditions, advancedConditions, connection, storeLocation, contextKey, inputKey } = config;
        const { key, region } = connection;

        try {
            let user: IDYUser = {};
            let session: IDYSession = {};
            let device: IDYDevice = {};

            // Check if Dynamic Yield user should be used
            if (useDYID && dyID?.length !== 0) {
                user.dyid = dyID;
            }

            // Check if Dynamic Yield session should be used
            if (useDYSession && dySession?.length !== 0) {
                session.dy = dySession;
            }

            // Check if the ip address of the user should be used
            if (useIPAddress && input?.ip?.length !== 0) {
                device.ip = input.ip;
            }

            // Check if the lexicon should be used
            if (useLexicon) {

                // Remove the default value from conditions
                conditions = [];

                // Check if advanced conditions are not empty
                if (Object?.keys(advancedConditions)?.length !== 0) {
                    // Loop through the JSON array of advanced conditions and add it to the conditions array
                    for (let adavncedCondition of advancedConditions) {
                        conditions.push(adavncedCondition);
                    }
                }

                for (const slotName in input.slots) {
                    if (input.slots.hasOwnProperty(slotName)) {
                        const slotValues = input.slots[slotName];

                        // Determine action based on slotName
                        const action = "IS";

                        // Iterate over slot values and add them to the conditions array
                        for (const slotValue of slotValues) {
                            // Construct condition object for each slot value
                            const condition = {
                                "field": slotName,
                                "arguments": [{ "action": action, "value": slotValue.keyphrase }]
                            };

                            // Add condition to the conditions array
                            conditions.push(condition);
                        }
                    }
                }
            }

            // Check if debugging is enabled
            if (logConditions) {
                api.log("debug", `[Dynamic Yield] Conditions: ${JSON.stringify(conditions)}`);
            }


            let url: string = "";
            if (region === 'eu') {
                url = 'https://direct.dy-api.eu/v2/serve/user/choose';
            } else {
                url = 'https://direct.dy-api.com/v2/serve/user/choose';
            }

            const response = await axios({
                method: "post",
                url,
                headers: {
                    "accept": "application/json",
                    "content-type": "application/json",
                    "DY-API-Key": key
                },
                data: {
                    user,
                    session,
                    "selector": {
                        "names": selectorNames,
                        "args": {
                            "Cognigy": {
                                "realtimeRules": [
                                    {
                                        "type": "include",
                                        "slots": [],
                                        "query": {
                                            conditions
                                        }
                                    }
                                ]
                            }
                        }
                    },
                    "context": {
                        "page": {
                            "type": contextPageType,
                            "data": [],
                            "location": contextPageLocation,
                            "locale": useLocale && input?.language ? input?.language?.replace("-", "_") : ""
                        },
                        device
                    },
                    "options": {
                        "isImplicitPageview": true
                    }
                }
            });

            if (response?.data?.choices[0]?.variations[0]?.payload?.data?.slots?.length !== 0) {
                const onFound = childConfigs.find(child => child.type === "onFound");
                api.setNextNode(onFound.id);
            } else {
                const onNotFound = childConfigs.find(child => child.type === "onNotFound");
                api.setNextNode(onNotFound.id);
            }

            if (storeLocation === "context") {
                api.addToContext(contextKey, response?.data?.choices[0]?.variations[0]?.payload?.data?.slots, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, response?.data?.choices[0]?.variations[0]?.payload?.data?.slots);
            }
        } catch (error) {

            const onNotFound = childConfigs.find(child => child.type === "onNotFound");
            api.setNextNode(onNotFound.id);

            if (storeLocation === "context") {
                api.addToContext(contextKey, { error: error }, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, { error: error });
            }
        }
    }
});

export const onFound = createNodeDescriptor({
    type: "onFound",
    parentType: "choose",
    defaultLabel: {
        default: "Found Products"
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

export const onNotFound = createNodeDescriptor({
    type: "onNotFound",
    parentType: "choose",
    defaultLabel: {
        default: "Else"
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
