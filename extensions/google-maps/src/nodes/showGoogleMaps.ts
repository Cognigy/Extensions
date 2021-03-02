import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { getGoogleMapsLocation } from "../helper/getGoogleMapsLocation";

/**
 * This file contains a simple node with many field types, sections, etc
 *
 * It demonstrates how you can write a new flow-node in Cognigy.AI 4.0.0
 * and shows important concepts
 */
export interface IShowGoogleMaps extends INodeFunctionBaseParams {
	config: {
		connection: {
			key: string;
		};
		zoom: number;
		longitude: number;
		latitude: number;
		searchchoice: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
		searchquery: any;
	};
}
export const showGoogleMaps = createNodeDescriptor({
	type: "showGoogleMaps",
	defaultLabel: "Show Google Maps",
	preview: {
		key: "searchquery",
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
			key: "latitude",
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
			key: "longitude",
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
			key: "zoom",
			label: "Map Zoom",
			type: "cognigyText",
			defaultValue: "12",
			params: {
				required: false
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
			defaultValue: "google.maps",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "google.maps",
			condition: {
				key: "storeLocation",
				value: "context"
			}
		}
	],
	sections: [
		{
			key: "advanced",
			label: "Advanced",
			defaultCollapsed: true,
			fields: [
				"zoom",
			]
		},
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
		{ type: "field", key: "searchquery" },
		{ type: "field", key: "latitude" },
		{ type: "field", key: "longitude" },
		{ type: "section", key: "advanced" },
		{ type: "section", key: "storageOption" },
	],
	appearance: {
		color: "#1e9c6d"
	},
	function: async ({ cognigy, config }: IShowGoogleMaps) => {
		const { api } = cognigy;
		let { connection, storeLocation, inputKey, contextKey, searchquery, latitude, longitude, zoom, searchchoice } = config;
		const { key } = connection;

		try {

			// check selected value for searchchoice
			switch (searchchoice) {
				case "address":
					const response = await getGoogleMapsLocation(key, searchquery);
					const { lng, lat } = response.location.geometry.location;
					latitude = lat;
					longitude = lng;
					break;
			}

			api.output('', {
				"_plugin": {
					"type": 'google-maps',
					"center": {
						"lat": Number(latitude),
						"lng": Number(longitude)
					},
					"zoom": Number(zoom),
					"apikey": key
				}
			});

		} catch (error) {
			if (storeLocation === "context") {
				api.addToContext(contextKey, error, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, error);
			}
		}
	}
});