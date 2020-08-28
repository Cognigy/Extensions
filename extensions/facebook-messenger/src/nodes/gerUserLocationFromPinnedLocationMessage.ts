import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';

export interface IGetUserLocationPinnedParams extends INodeFunctionBaseParams {
	config: {
		connection?: {
			key: string;
		};
		storeLocation: string
		inputKey: string;
		contextKey: string;
	};
}

export const getUserLocationFromPinnedLocationMessageNode = createNodeDescriptor({
	type: "getUserLocationFromPinnedLocationMessage",
	defaultLabel: "Get User Location from Pinned Location",
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
		{ type: "section", key: "storageOption" },
	],
	appearance: {
		color: "#0078FF"
	},
	function: async ({ cognigy, config }: IGetUserLocationPinnedParams) => {
		const { api, input } = cognigy;
		const { connection, storeLocation, inputKey, contextKey } = config;
		const { key } = connection;

		try {

			// get the current user message data object
			const { data } = input?.input;
			const { request } = data;
			const { message } = request;
			const { attachments } = message;


			// get the user location payload url
			let userLocation = {};
			let address = "";

			if (attachments[0].type === 'location') {
				const locationUrlStringified = attachments[0].payload.url;
				const locationUrl = decodeURI(locationUrlStringified);

				// extract the longitude and latitude information
				let locationResult = locationUrl.match(/[1-9]+\.[1-9]+/g);
				userLocation = {
					latitude: locationResult[0],
					longitude: locationResult[1]
				};

				// check if two values were found in the url (long, lat)
				if (locationResult.length === 2) {
					// do something
				}
			} else {
				throw new Error('No location defined');
			}

			// get the google maps location of the search term based on the user location
			const place = await axios({
				url: `https://maps.googleapis.com/maps/api/geocode/json?key=${key}&latlng=${userLocation["latitude"]},${userLocation["longitude"]}`,
				method: 'GET'
			});
			try {
				address = place.data.results[0].formatted_address;
			} catch (error) {
				// location not found
				throw new Error('New Google Maps location found based on the location and search term.');
			}

			if (storeLocation === "context") {
				api.addToContext(contextKey, {
					user: userLocation,
					address
				}, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, {
					user: userLocation,
					address
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
