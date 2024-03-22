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
        conditions: any;
        advancedConditions: any;
        storeLocation: string;
        contextKey: string;
        inputKey: string;
    };
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
            defaultValue: `{
                "field": "price",
                "arguments": [
                   {
                      "action": "LT",
                      "value": 40
                   }
                ]
             }`,
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
            defaultValue: "{}",
            condition: {
                key: "useLexicon",
                value: true
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
        }
    ],
    sections: [
        {
            key: "conditionsOptions",
            label: {
                default: "Condition Options",
                deDE: "Bedingungen"
            },
            defaultCollapsed: true,
            fields: [
                "useLexicon",
                "conditions",
                "advancedConditions"
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
        { type: "section", key: "storageOptions" },
    ],
    appearance: {
        color: "#E60887"
    },
    function: async ({ cognigy, config }: IChooseParams) => {
        const { api, input } = cognigy;
        const { selectorNames, contextPageLocation, contextPageType, advancedConditions, connection, storeLocation, contextKey, inputKey } = config;
        const { key, region } = connection;

        try {

            // Create conditions based on the Lexicon slot results
            let conditions = [];

            if (Object?.keys(advancedConditions)?.length !== 0) {
                conditions.push(advancedConditions);
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
                    "user": {},
                    "selector": {
                        "names": selectorNames,
                        "args": {
                            "Chatbot_Reco": {
                                "realtimeRules": [
                                    {
                                        "type": "include",
                                        "slots": [],
                                        "query": {
                                            "conditions": conditions
                                        }
                                    }
                                ]
                            }
                        }
                    },
                    "context": {
                        "page": {
                            "type": contextPageType,
                            "data": [
                            ],
                            "location": contextPageLocation
                        }
                    },
                    "options": {
                        "isImplicitPageview": true
                    }
                }
            });

            if (storeLocation === "context") {
                api.addToContext(contextKey, response?.data?.choices[0]?.variations[0]?.payload?.data?.slots, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, response?.data?.choices[0]?.variations[0]?.payload?.data?.slots);
            }
        } catch (error) {

            if (storeLocation === "context") {
                api.addToContext(contextKey, { error: error }, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, { error: error });
            }
        }
    }
});