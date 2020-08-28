import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { getGoogleMapsLocation } from "../helper/getGoogleMapsLocation";

export interface IGetLocationFromText extends INodeFunctionBaseParams {
	config: {
		connection: {
			key: string;
		};
		place: string;
		city: string;
		country: string;
		storeType: string;
		contextKey: string;
		inputKey: string;
		storeLocation: string;
		inputStore: string;
	};
}
export const getLocationFromText = createNodeDescriptor({
	type: "getLocationFromText",
	defaultLabel: "Search Location",
	preview: {
		key: "place",
		type: "text"
	},
	fields: [
		{
			key: "connection",
			label: "API Key",
			type: "connection",
			params: {
				connectionType: "api-key",
				required: true
			}
		},
		{
			key: "place",
			label: "Place",
			type: "cognigyText",
			defaultValue: "",
			params: {
				required: true
			},
		},
		{
			key: "city",
			label: "City",
			type: "cognigyText",
			params: {
				required: true
			},
		},
		{
			key: "country",
			label: "Country",
			type: "cognigyText",
			params: {
				required: true
			},
		},
		{
			key: "storeLocation",
			type: "select",
			label: "Where to store the result",
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
			label: "Input Key to store Result",
			defaultValue: "maps",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "maps",
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
		{ type: "field", key: "place" },
		{ type: "field", key: "city" },
		{ type: "field", key: "country" },
		{ type: "section", key: "storageOption" },
	],
	appearance: {
		color: "#1e9c6d"
	},

	function: async ({ cognigy, config }: IGetLocationFromText) => {
		const { api } = cognigy;
		const { connection, place, city, country, storeLocation, contextKey, inputKey } = config;

		let userAddress: string;
		let latitude: any;
		let longitude: any;

		if (!place || !city || !country || !connection) {
		} else {
			try {
				let address = `${place}, ${city}, ${country}`.replace(/ /g, "%20");

				const response = await getGoogleMapsLocation(connection.key, address);

				try {
					userAddress = response.location.formatted_address;
					latitude = response.location.geometry.location.lat;
					longitude = response.location.geometry.location.lng;

					if (storeLocation === "context") {
						api.addToContext(contextKey, {
							"coordinates": {
								"longitude": longitude,
								"latitude": latitude
							},
							"address": userAddress,
							"name": place
						}, "simple");
					} else {
						// @ts-ignore
						api.addToInput(inputKey, {
							"coordinates": {
								"longitude": longitude,
								"latitude": latitude
							},
							"address": userAddress,
							"name": place
						});
					}

				} catch (error) {
					if (storeLocation === "context") {
						api.addToContext(contextKey, error, "simple");
					} else {
						// @ts-ignore
						api.addToInput(inputKey, error);
					}
				}
			} catch (error) {
			}
		}
	}
});