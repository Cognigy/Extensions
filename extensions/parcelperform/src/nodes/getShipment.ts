import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from "axios";
const qs = require("qs");

export interface IGetShipmentParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            clientId: string;
            clientSecret: string;
        };
        idType: string;
        shipmentId: string;
        orderId: string;
        trackingNumber: string;
        storeLocation: string;
        inputKey: string;
        contextKey: string;
    };
}

const calculateCreatedDateFrom = (): string => {
    // Create a new Date object for the current date
    const currentDate = new Date();

    // Set the time to the start of the day
    currentDate.setHours(0, 0, 0, 0);

    // Calculate the date exactly 12 months ago
    const pastDate = new Date(currentDate.setMonth(currentDate.getMonth() - 12));

    // Format the date manually to exclude seconds and timezone information
    return pastDate.getFullYear() + '-'
        + ('0' + (pastDate.getMonth() + 1)).slice(-2) + '-'
        + ('0' + pastDate.getDate()).slice(-2) + 'T00:00:00';
}

export const getShipmentNode = createNodeDescriptor({
    type: "getShipment",
    defaultLabel: "Get Shipment",
    summary: "Retrieve details of a single shipment",
    fields: [
        {
            key: "connection",
            label: "parcelperform",
            type: "connection",
            description: "API authentication information for parcelperform",
            params: {
                connectionType: 'parcelperform',
                required: true
            }
        },
        {
            key: "idType",
            label: "Type",
            type: "select",
            description: "The type of the shipment identifier",
            defaultValue: "trackingNumber",
            params: {
                required: true,
                options: [
                    {
                        label: "Shipment ID",
                        value: "shipmentId"
                    },
                    {
                        label: "Oder ID",
                        value: "orderId"
                    },
                    {
                        label: "Tracking Number",
                        value: "trackingNumber"
                    }
                ],
            }
        },
        {
            key: "shipmentId",
            label: "Shipment ID",
            type: "cognigyText",
            condition: {
                key: "idType",
                value: "shipmentId"
            }
        },
        {
            key: "orderId",
            label: "Order ID",
            type: "cognigyText",
            condition: {
                key: "idType",
                value: "orderId"
            }
        },
        {
            key: "trackingNumber",
            label: "Tracking Number",
            type: "cognigyText",
            condition: {
                key: "idType",
                value: "trackingNumber"
            }
        },
        {
            key: "storeLocation",
            type: "select",
            label: "Where to Store the Result",
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
            label: "Input Key to Store Result",
            defaultValue: "parcelperform",
            condition: {
                key: "storeLocation",
                value: "input"
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: "Context Key to store Result",
            defaultValue: "parcelperform",
            condition: {
                key: "storeLocation",
                value: "context"
            }
        }
    ],
    sections: [
        {
            key: "storageOption",
            label: "Storage Option",
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
        { type: "field", key: "idType" },
        { type: "field", key: "shipmentId" },
        { type: "field", key: "orderId" },
        { type: "field", key: "trackingNumber" },
        { type: "section", key: "storageOption" }
    ],
    appearance: {
        color: "#001b3a"
    },
    dependencies: {
        children: [
            "onFoundShipment",
            "onNotFoundShipment"
        ]
    },
    function: async ({ cognigy, config, childConfigs }: IGetShipmentParams) => {
        const { api, input } = cognigy;
        const { connection, idType, trackingNumber, orderId, shipmentId, storeLocation, inputKey, contextKey } = config;
        const { clientId, clientSecret } = connection;


        try {
            const authData = qs.stringify({
                "grant_type": "client_credentials"
            });

            const authResponse = await axios({
                method: "post",
                url: "https://api.parcelperform.com/auth/oauth/token/",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Accept": "application/json"
                },
                auth: {
                    username: clientId,
                    password: clientSecret
                },
                data: authData
            });

            const createdDateFrom = calculateCreatedDateFrom();

            // Create the dynamic request URL with dates and id type
            let url: string = "";
            switch (idType) {
                case "orderId":
                    url = `https://api.parcelperform.com/v5/shipment/list/?created_date_from=${createdDateFrom}&created_date_to=${input.currentTime.year}-${input.currentTime.month}-${input.currentTime.day}T00:00:00&order_id=${orderId}`;
                    break;
                case "shipmentId":
                    url = `https://api.parcelperform.com/v5/shipment/list/?created_date_from=${createdDateFrom}&created_date_to=${input.currentTime.year}-${input.currentTime.month}-${input.currentTime.day}T00:00:00&shipment_id=${shipmentId}`;
                    break;
                case "trackingNumber":
                    url = `https://api.parcelperform.com/v5/shipment/list/?created_date_from=${createdDateFrom}&created_date_to=${input.currentTime.year}-${input.currentTime.month}-${input.currentTime.day}T00:00:00&tracking_number=${trackingNumber}`;
                    break;
            }

            const response = await axios({
                method: "get",
                url,
                headers: {
                    "Authorization": `Bearer ${authResponse?.data?.access_token}`,
                    "Accept": "application/json"
                }
            });

            if (response?.data?.data?.length !== 0) {
                const onFoundShipment = childConfigs.find(child => child.type === "onFoundShipment");
                api.setNextNode(onFoundShipment.id);
            } else {
                const onNotFoundShipment = childConfigs.find(child => child.type === "onNotFoundShipment");
                api.setNextNode(onNotFoundShipment.id);
            }

            if (storeLocation === "context") {
                api.addToContext(contextKey, response.data?.data[0], "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, response.data?.data[0]);
            }

        } catch (error) {
            const onNotFoundShipment = childConfigs.find(child => child.type === "onNotFoundShipment");
            api.setNextNode(onNotFoundShipment.id);

            if (storeLocation === 'context') {
                api.addToContext(contextKey, { error: error.message }, 'simple');
            } else {
                // @ts-ignore
                api.addToInput(inputKey, { error: error.message });
            }
        }
    }
});

export const onFoundShipment = createNodeDescriptor({
    type: "onFoundShipment",
    parentType: "getShipment",
    defaultLabel: {
        default: "Found",
        deDE: "Gefunden"
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

export const onNotFoundShipment = createNodeDescriptor({
    type: "onNotFoundShipment",
    parentType: "getShipment",
    defaultLabel: {
        default: "Not Found",
        deDE: "Nicht gefunden"
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