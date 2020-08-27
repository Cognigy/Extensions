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
		zoom: any;
		longitude: any;
		latitude: any;
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
				disabled: false,
				placeholder: "",
				required: true
			}
		},
		{
			key: "latitude",
			label: "Latitude",
			type: "cognigyText",
			defaultValue: "",
			condition: {
				key: "searchchoice",
				value: "coordinates"
			},
			params: {
				disabled: false,
				placeholder: "",
				required: false
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
				disabled: false,
				placeholder: "",
				required: false
			}
		},
		{
			key: "zoom",
			label: "Map Zoom",
			type: "cognigyText",
			params: {
				disabled: false,
				placeholder: "",
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
			key: "zoomSection",
			label: "Zoom",
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
		{ type: "section", key: "zoomSection" },
		{ type: "section", key: "storageOption" },
	],
	appearance: {
		color: "#1e9c6d"
	},
	function: async ({ cognigy, config }: IShowGoogleMaps) => {
		const { api } = cognigy;
		const { connection, storeLocation, inputKey, contextKey, searchquery, latitude, longitude, zoom } = config;

		let request_success: boolean = false;

		let longnew: number = longitude;
		let latnew: number = latitude;
		let zoomnew: number = zoom;

		if (isNaN(latitude) || !latitude) {
			latnew = (51.2141562) as number;
		}
		if (isNaN(longitude) || !longitude) {
			longnew = (6.7488952) as number;
		}
		if (isNaN(zoom) || !zoom) {
			zoomnew = 10 as number;
		}
		if (searchquery !== null || searchquery !== "") {

			const response = await getGoogleMapsLocation(connection.key, searchquery);

			try {
				const { lng, lat } = response.location.geometry.location;
				request_success;
				longnew = lng;
				latnew = lat;
			} catch (error) {
				if (storeLocation === "context") {
					api.addToContext(contextKey, error, "simple");
				} else {
					// @ts-ignore
					api.addToInput(inputKey, error);
				}
			}
		}

		if (request_success || (longitude != null && latitude != null)) {
			api.output('', {
				"_plugin": {
					"type": 'google-maps',
					"center": {
						"lat": latnew,
						"lng": longnew
					},
					"zoom": Number(zoomnew),
					"bootstrapURLKeys": connection.key
				}
			});
		} else {
			if (storeLocation === "context") {
				api.addToContext(contextKey, "location not found", "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, "location not found");
			}
		}
	}
});