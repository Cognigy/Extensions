import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';

export interface IGetUserLocationTextParams extends INodeFunctionBaseParams {
	config: {
		connection?: {
			key: string;
		};
		place: string;
		city: string;
		country: string;
		storeLocation: string
		inputKey: string;
		contextKey: string;
	};
}

export const getUserLocationFromTextMessageNode = createNodeDescriptor({
	type: "getUserLocationFromTextMessage",
	defaultLabel: "Get User Location from Text",
	fields: [
		{
			key: "connection",
			label: "Google Maps Connection",
			type: "connection",
			params: {
				connectionType: "google",
				required: true
			}
		},
		{
			key: "place",
			label: "Place",
			description: "The name of the google maps place, e.g. Cognigy or Aldi.",
			type: "cognigyText",
			params: {
				required: true
			}
		},
		{
			key: "city",
			label: "City",
			type: "cognigyText",
			params: {
				required: true
			}
		},
		{
			key: "country",
			label: "Country",
			type: "cognigyText",
			params: {
				required: true
			}
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
			defaultValue: "messenger",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "messenger",
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
				"contextKey",
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
		color: "#0078FF"
	},
	function: async ({ cognigy, config }: IGetUserLocationTextParams) => {
		const { api } = cognigy;
		const { connection, place, city, country, storeLocation, inputKey, contextKey } = config;
		const { key } = connection;

		// create google search address from user information
		let address = `${place}, ${city}, ${country}`;

		// initialize variables to fill them later with google location
		let userAddress = "";
		let userLocation = {};

		try {

			// get the google maps location of the search term based on the user location
			const place = await axios({
				url: `https://maps.googleapis.com/maps/api/geocode/json?key=${key}&address=${address}`,
				method: 'GET'
			});
			try {
				userAddress = place.data.results[0].formatted_address;
				userLocation = {
					latitude: place.data.results[0].geometry.location.lat,
					longitude: place.data.results[0].geometry.location.lng
				};
			} catch (error) {
				// location not found
				throw new Error('New Google Maps location found based on the location and search term.');
			}

			if (storeLocation === "context") {
				api.addToContext(contextKey, {
					user: userLocation,
					address: userAddress
				}, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, {
					user: userLocation,
					address: userAddress
				});
			}
		} catch (error) {
			if (storeLocation === "context") {
				api.addToContext(contextKey, { error: error.message }, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, { error: error.message });
			}
		}
	}
});
