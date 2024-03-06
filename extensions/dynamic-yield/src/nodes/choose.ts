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
            defaultValue: "dy",
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
            defaultValue: "dy",
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
        { type: "field", key: "selectorNames" },
        { type: "field", key: "contextPageType" },
        { type: "field", key: "contextPageLocation" },
        { type: "section", key: "storage" },
    ],
    appearance: {
        color: "#E60887"
    },
    function: async ({ cognigy, config }: IChooseParams) => {
        const { api } = cognigy;
        const { selectorNames, contextPageLocation, contextPageType, connection, storeLocation, contextKey, inputKey } = config;
        const { key, region } = connection;

        try {

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
                        "names": selectorNames
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
                        "isImplicitPageview": false
                    }
                }
            });

            if (storeLocation === "context") {
                api.addToContext(contextKey, response.data, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, response.data);
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