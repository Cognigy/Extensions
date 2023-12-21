import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

export interface IgetTrackingInformationParams extends INodeFunctionBaseParams {
    config: {
        apiConnection: {
            apiKey: string;
        };
        trackingNumber: string;
        language: string;
        recipientPostalCode: string;
        storeLocation: string;
        inputKey: string;
        contextKey: string;
    };
}

export const getTrackingInformationNode = createNodeDescriptor({
    type: "getTrackingInformation",
    defaultLabel: {
        deDE: "Sendung verfolgen",
        default: "Track Shipment"
    },
    summary: {
        deDE: " Status einer Sendung erhalten",
        default: "Get the tracking status of a package."
    },
    preview: {
        key: "trackingNumber",
        type: "text"
    },
    fields: [
        {
            key: "apiConnection",
            label: "DHL API Key",
            type: "connection",
            description: {
                deDE: "API Key der DHL API",
                default: "API authentication information for DHL"
            },
            params: {
                connectionType: 'dhl',
                required: true
            }
        },
        {
            key: "trackingNumber",
            label: {
                deDE: "Sendungsnummer",
                default: "Tracking Number"
            },
            type: "cognigyText",
            description: {
                deDE: "Die Sendungsnummer abgefragten DHL Sendung.",
                default: "Tracking number for the delivery you wish to see."
            },
            params: {
                required: true
            }
        },
        {
            key: "language",
            label: {
                deDE: "Ergebnissprache",
                default: "Response Language"
            },
            type: "cognigyText",
            description: {
                deDE: "Die Antwortsprache im ISO 639-1 Format, bspw. en, de, jp etc.",
                default: "Response language for the client in ISO 639-1 two character format (en, de, jp etc.)"
            },
            defaultValue: "en"
        },
        {
            key: "recipientPostalCode",
            label: {
                deDE: "Empfänger Postleitzahl",
                default: "Recipient Postal Code"
            },
            type: "cognigyText",
            defaultValue: "",
        },
        {
            key: "storeLocation",
            type: "select",
            label: {
                deDE: "Wo das Ergebnis gespeichert werden soll",
                default: "Where to Store the Result"
            },
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
            defaultValue: "input"
        },
        {
            key: "inputKey",
            type: "cognigyText",
            label: {
                deDE: "Input Key zur Speicherung",
                default: "Input Key to Store Result"
            },
            defaultValue: "trackingInfo",
            condition: {
                key: "storeLocation",
                value: "input"
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: {
                deDE: "Context Key zur Speicherung",
                default: "Context Key to Store Result"
            },
            defaultValue: "trackingInfo",
            condition: {
                key: "storeLocation",
                value: "context"
            }
        }
    ],
    sections: [
        {
            key: "advanced",
            label: {
                deDE: "Erweitert",
                default: "Advanced"
            },
            defaultCollapsed: true,
            fields: [
                "language",
                "recipientPostalCode"
            ]
        },
        {
            key: "storageOption",
            label: {
                deDE: "Speicheroption",
                default: "Storage Option"
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
        { type: "field", key: "apiConnection" },
        { type: "field", key: "trackingNumber" },
        { type: "section", key: "advanced" },
        { type: "section", key: "storageOption" }
    ],
    appearance: {
        color: "#FFCC00"
    },
    dependencies: {
        children: [
            "pretransit",
            "transit",
            "delivered",
            "failure",
            "unknown"
        ]
    },
    function: async ({ cognigy, config, childConfigs }: IgetTrackingInformationParams) => {
        const { api } = cognigy;
        const { apiConnection, trackingNumber, language, recipientPostalCode, storeLocation, inputKey, contextKey } = config;
        const { apiKey } = apiConnection;

        try {
            const result: AxiosResponse = await axios.get(`https://api-eu.dhl.com/track/shipments`, {
                params: {
                    trackingNumber,
                    language,
                    recipientPostalCode
                },
                headers: {
                    'DHL-API-Key': apiKey,
                }
            });

            const trackingStatusOrig = result.data.shipments[0].status.statusCode;

            let trackingStatusNum;
            let onTrackingChild;

            switch (trackingStatusOrig) {
                case "pre-transit":
                    trackingStatusNum = "0";
                    onTrackingChild = childConfigs.find(child => child.type === "pretransit");
                    break;
                case "transit":
                    trackingStatusNum = "1";
                    onTrackingChild = childConfigs.find(child => child.type === "transit");
                    break;
                case "delivered":
                    trackingStatusNum = "2";
                    onTrackingChild = childConfigs.find(child => child.type === "delivered");
                    break;
                default:
                    onTrackingChild = childConfigs.find(child => child.type === "unknown");
                    trackingStatusNum = "No information available";
            }

            api.setNextNode(onTrackingChild.id);

            const trackingResults = {
                details: result.data,
                statusNum: trackingStatusNum
            };

            if (storeLocation === 'context') {
                api.addToContext(contextKey, trackingResults, 'simple');
            } else {
                // @ts-ignore
                api.addToInput(inputKey, trackingResults);
            }
        } catch (error) {
            if (storeLocation === 'context') {
                api.addToContext(contextKey, { error: error.message }, 'simple');
            } else {
                // @ts-ignore
                api.addToInput(inputKey, { error: error.message });
            }
            const onErrorChild = childConfigs.find(child => child.type === "failure");
            api.setNextNode(onErrorChild.id);

        }
    }
});

export const pretransit = createNodeDescriptor({
    type: "pretransit",
    parentType: "getTrackingInformation",
    defaultLabel: "Pre Transit",
    constraints: {
        editable: false,
        deletable: true,
        creatable: true,
        movable: false,
        placement: {
            predecessor: {
                whitelist: []
            }
        }
    },
    appearance: {
        color: "#FFCC00",
        textColor: "white",
        variant: "mini"
    }
});

export const transit = createNodeDescriptor({
    type: "transit",
    parentType: "getTrackingInformation",
    defaultLabel: "Transit",
    constraints: {
        editable: false,
        deletable: true,
        creatable: true,
        movable: false,
        placement: {
            predecessor: {
                whitelist: []
            }
        }
    },
    appearance: {
        color: "#FFCC00",
        textColor: "white",
        variant: "mini"
    }
});

export const delivered = createNodeDescriptor({
    type: "delivered",
    parentType: "getTrackingInformation",
    defaultLabel: "Delivered",
    constraints: {
        editable: false,
        deletable: true,
        creatable: true,
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

export const failure = createNodeDescriptor({
    type: "failure",
    parentType: "getTrackingInformation",
    defaultLabel: "Failure",
    constraints: {
        editable: false,
        deletable: true,
        creatable: true,
        movable: false,
        placement: {
            predecessor: {
                whitelist: []
            }
        }
    },
    appearance: {
        color: "#cf142b",
        textColor: "white",
        variant: "mini"
    }
});

export const unknown = createNodeDescriptor({
    type: "unknown",
    parentType: "getTrackingInformation",
    defaultLabel: "Unknown",
    constraints: {
        editable: false,
        deletable: true,
        creatable: true,
        movable: false,
        placement: {
            predecessor: {
                whitelist: []
            }
        }
    },
    appearance: {
        color: "#cf142b",
        textColor: "white",
        variant: "mini"
    }
});

