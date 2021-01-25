import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { getGoogleMapsLocation, getGoogleMapsLocationFromGeocodes } from "../helper/getGoogleMapsLocation";

export interface IGetLocationFromText extends INodeFunctionBaseParams {
	config: {
		connection: {
			key: string;
		};
		long: number;
		lat: number;
		searchchoice: string;
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
			key: "searchchoice",
			type: "select",
			label: "Location Type",
			defaultValue: "address",
			params: {
				options: [
					{
						label: "Address",
						value: "address",
					},
					{
						label: "Coordinates",
						value: "coordinates",
					},
				],
			},
		},
		{
			key: "searchquery",
			label: "Address",
			type: "cognigyText",
			defaultValue: "Speditionsstraße 1",
			condition: {
				key: "searchchoice",
				value: "address"
			},
			params: {
				required: true
			}
		},
		{
			key: "lat",
			label: "Latitude",
			type: "cognigyText",
			condition: {
				key: "searchchoice",
				value: "coordinates"
			},
			params: {
				required: true
			}
		},
		{
			key: "long",
			label: "Longitude",
			type: "cognigyText",
			condition: {
				key: "searchchoice",
				value: "coordinates"
			},
			params: {
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
			condition: {
				key: "searchchoice",
				value: "address"
			},
		},
		{
			key: "city",
			label: "City",
			type: "cognigyText",
			params: {
				required: true
			},
			condition: {
				key: "searchchoice",
				value: "address"
			},
		},
		{
			key: "country",
			label: "Country",
			type: "cognigyText",
			params: {
				required: true
			},
			condition: {
				key: "searchchoice",
				value: "address"
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
		{ type: "field", key: "searchchoice" },
		{ type: "field", key: "lat" },
		{ type: "field", key: "long" },
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
		const { connection, searchchoice, lat, long, place, city, country, storeLocation, contextKey, inputKey } = config;

		if (searchchoice === "address") {
			let userAddress: string;
			let latitude: any;
			let longitude: any;

			if (!place || !city || !country || !connection) {
				throw new Error("The request is missing the 'place', 'city' or 'country' value");
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
					if (storeLocation === "context") {
						api.addToContext(contextKey, error, "simple");
					} else {
						// @ts-ignore
						api.addToInput(inputKey, error);
					}
				}
			}
		} else if (searchchoice === "coordinates") {

			const response = await getGoogleMapsLocationFromGeocodes(connection.key, `${lat},${long}`);

			if (storeLocation === "context") {
				api.addToContext(contextKey, {
					address: response.location.formatted_address
				}, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, {
					address: response.location.formatted_address
				});
			}
		}
	}
});