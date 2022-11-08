import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from "axios";

export interface ITrackShipmentParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			accessKey: string;
		};
		trackingNumber: string;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const trackShipmentNode = createNodeDescriptor({
	type: "trackShipment",
	defaultLabel: {
		default: "Track Shipment",
		deDE: "Lieferung verfolgen"
	},
	summary: {
		default: "Tracks the shipment by a given number",
		deDE: "Verfolgt eine Lieferung auf Grundlage der Sendungsnummer"
	},
	fields: [
		{
			key: "connection",
			label: {
				default: "UPS Connection",
				deDE: "UPS Verbindung"
			},
			type: "connection",
			params: {
				connectionType: "ups-access-key",
				required: true
			}
		},
		{
			key: "trackingNumber",
			label: {
				default: "Tracking Number",
				deDE: "Sendungsnummer"
			},
			type: "cognigyText",
			description: {
				default: "The tracking number of the shipment",
				deDE: "Die Sendungsnummer der Lieferung"
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
			defaultValue: "ups",
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
			defaultValue: "ups",
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
		{ type: "field", key: "trackingNumber" },
		{ type: "section", key: "storage" },
	],
	appearance: {
		color: "#ffc400"
	},
	dependencies: {
		children: [
			"onFoundShipment",
			"onNotFoundShipment"
		]
	},
	function: async ({ cognigy, config, childConfigs }: ITrackShipmentParams) => {
		const { api, input } = cognigy;
		const { connection, trackingNumber, storeLocation, contextKey, inputKey } = config;
		const { accessKey } = connection;

		try {

			const response = await axios({
				method: "get",
				url: `https://onlinetools.ups.com/track/v1/details/${trackingNumber}`,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json",
					"AccessLicenseNumber": accessKey,
					"transId": input.inputId,
					"transactionSrc": "cognigy"
				}
			});

			// If a shipment was found
			if (response?.data?.trackResponse?.shipment[0]?.inquiryNumber) {
				const onFoundShipment = childConfigs.find(child => child.type === "onFoundShipment");
				api.setNextNode(onFoundShipment.id);
			} else {
				const onNotFoundShipment = childConfigs.find(child => child.type === "onNotFoundShipment");
				api.setNextNode(onNotFoundShipment.id);
			}

			if (storeLocation === "context") {
				api.addToContext(contextKey, response.data, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, response.data);
			}
		} catch (error) {
			if (storeLocation === "context") {
				api.addToContext(contextKey, { error: error.message }, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, { error: error.message });
			}

			const onNotFoundShipment = childConfigs.find(child => child.type === "onNotFoundShipment");
			api.setNextNode(onNotFoundShipment.id);
		}
	}
});

export const onFoundShipment = createNodeDescriptor({
	type: "onFoundShipment",
	parentType: "trackShipment",
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
	parentType: "trackShipment",
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

