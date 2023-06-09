import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';

export interface IFindStopsParams extends INodeFunctionBaseParams {
	config: {
		queryType: string;
		query: string;
		latitude: string;
		longitude: string;
		distance: string;
		fuzzy: boolean;
		results: number;
		stops: boolean;
		addresses: boolean;
		poi: boolean;
		linesOfStops: boolean;
		language: string;
		outputResultAsQuickReplyMessage: boolean;
		outputText: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}
export const findStopsNode = createNodeDescriptor({
	type: "findStops",
	defaultLabel: {
		default: "Find Stations",
		deDE: "Suche Haltestellen"
	},
	summary: {
		default: "Finds a list of stations based on a query",
		deDE: "Findet Haltestellen nach Suchanfrage"
	},
	fields: [
		{
			key: "queryType",
			label: {
				default: "Type",
				deDE: "Typ"
			},
			type: "select",
			defaultValue: "query",
			params: {
				options: [
					{
						label: {
							default: "Query",
							deDE: "Suchanfrage"
						},
						value: "query"
					},
					{
						label: {
							default: "Location",
							deDE: "Position"
						},
						value: "location"
					}
				],
				required: true
			}
		},
		{
			key: "query",
			label: {
				default: "Query",
				deDE: "Suchanfrage"
			},
			type: "cognigyText",
			defaultValue: "{{input.text}}",
			params: {
				required: true
			},
			condition: {
				key: "queryType",
				value: "query"
			}
		},
		{
			key: "fuzzy",
			label: {
				default: "Fuzzy",
				deDE: "Fuzzy"
			},
			type: "toggle",
			defaultValue: true,
			description: {
				default: "Find more than exact matches",
				deDE: "Findet mehr als exakte Treffer"
			},
			condition: {
				key: "queryType",
				value: "query"
			}
		},
		{
			key: "results",
			label: {
				default: "Number Results",
				deDE: "Anzahl Ergebnisse"
			},
			type: "number",
			defaultValue: 10,
			description: {
				default: "How many stations should be shown",
				deDE: "Wieviele Haltestellen gezeigt werden sollen"
			},
		},
		{
			key: "stops",
			label: {
				default: "Show Stops",
				deDE: "Zeige Stopps"
			},
			type: "toggle",
			defaultValue: true
		},
		{
			key: "addresses",
			label: {
				default: "Show Addresses",
				deDE: "Zeige Adressen"
			},
			type: "toggle",
			defaultValue: true
		},
		{
			key: "poi",
			label: {
				default: "Show Points of Interest",
				deDE: "Zeige interessante Orte"
			},
			type: "toggle",
			defaultValue: true
		},
		{
			key: "linesOfStops",
			label: {
				default: "Lines of Stops",
				deDE: "Linien der Stopps"
			},
			type: "toggle",
			defaultValue: false,
			description: {
				default: "Parse and return lines of each stop or station",
				deDE: "Gebe die Linie des Stopps or Haltestelle zurück"
			}
		},
		{
			key: "language",
			label: {
				default: "Language",
				deDE: "Sprache"
			},
			type: "select",
			defaultValue: "de",
			params: {
				options: [
					{
						label: {
							default: "German",
							deDE: "Deutsch"
						},
						value: "de"
					},
					{
						label: {
							default: "English",
							deDE: "Englisch"
						},
						value: "en"
					}
				]
			}
		},
		{
			key: "latitude",
			label: {
				default: "Latitude",
				deDE: "Breitengrad"
			},
			type: "cognigyText",
			description: {
				default: "The latitude of the current user position",
				deDE: "Der Breitengrad der aktuellen Nutzerposition"
			},
			condition: {
				key: "queryType",
				value: "location"
			}
		},
		{
			key: "longitude",
			label: {
				default: "Longitude",
				deDE: "Längengrad"
			},
			type: "cognigyText",
			description: {
				default: "The longitude of the current user position",
				deDE: "Der Längengrad der aktuellen Nutzerposition"
			},
			condition: {
				key: "queryType",
				value: "location"
			}
		},
		{
			key: "distance",
			label: {
				default: "distance",
				deDE: "Distanz"
			},
			type: "cognigyText",
			description: {
				default: "The maximum walking distance in meters",
				deDE: "Die maximale Laufdistanz in Metern"
			},
			condition: {
				key: "queryType",
				value: "location"
			}
		},
		{
			key: "outputResultAsQuickReplyMessage",
			label: {
				default: "Output stops",
				deDE: "Haltestellen ausgeben"
			},
			type: "toggle",
			defaultValue: false,
			description: {
				default: "Whether to output the stops as quick reply message or not",
				deDE: "Ob die Ergebnisse als Quick Reply Nachricht ausgegeben werden sollen oder nicht"
			},
		},
		{
			key: "outputText",
			label: {
				default: "Text",
				deDE: "Text"
			},
			type: "cognigyText",
			description: {
				default: "The text of the quick reply message",
				deDE: "Der Text der Quick Reply Nachricht"
			},
			params: {
				required: true
			},
			condition: {
				key: "outputResultAsQuickReplyMessage",
				value: true
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
			defaultValue: "bvg.stops",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "bvg.stops",
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
				default: "Advanced",
				deDE: "Erweitert"
			},
			defaultCollapsed: true,
			fields: [
				"language",
				"results",
				"fuzzy",
				"poi",
				"linesOfStops",
				"addresses",
				"stops"
			]
		},
		{
			key: "output",
			label: {
				default: "Output",
				deDE: "Ausgabe"
			},
			defaultCollapsed: true,
			fields: [
				"outputResultAsQuickReplyMessage",
				"outputText"
			]
		},
		{
			key: "storageOption",
			label: {
				default: "Storage Option",
				deDE: "Speicheroption"
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
		{ type: "field", key: "connection" },
		{ type: "field", key: "queryType" },
		{ type: "field", key: "query" },
		{ type: "field", key: "latitude", },
		{ type: "field", key: "longitude" },
		{ type: "field", key: "distance" },
		{ type: "section", key: "output" },
		{ type: "section", key: "advanced" },
		{ type: "section", key: "storageOption" }
	],
	appearance: {
		color: '#f0d722'
	},
	function: async ({ cognigy, config }: IFindStopsParams) => {
		const { api } = cognigy;
		const { queryType, query, latitude, longitude, distance, fuzzy, results, stops, addresses, poi, linesOfStops, language, outputResultAsQuickReplyMessage, outputText, storeLocation, inputKey, contextKey } = config;

		try {

			let response;

			switch (queryType) {
				case "query":
					response = await axios({
						method: 'get',
						url: `https://v6.bvg.transport.rest/locations?query=${encodeURIComponent(query)}&fuzzy=${fuzzy}&results=${results}&stops=${stops}&addresses=${addresses}&poi=${poi}&linesOfStops=${linesOfStops}&language=${language}`,
						headers: {
							'accept': 'application/json'
						}
					});
					break;

				case "location":
					response = await axios({
						method: 'get',
						url: `https://v6.bvg.transport.rest/locations/nearby`,
						headers: {
							'accept': 'application/json'
						},
						params: {
							latitude,
							longitude,
							results,
							distance,
							poi,
							linesOfStops,
							language
						}
					});
					break;
			}

			if (storeLocation === "context") {
				api.addToContext(contextKey, response.data, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, response.data);
			}

			if (outputResultAsQuickReplyMessage === true) {
				let quickReplies = [];

				for (let stop of response.data) {
					quickReplies.push({
						"id": stop?.id,
						"contentType": "postback",
						"payload": stop?.name,
						"title": stop?.name,
						"imageUrl": ""
					});
				}

				api.say(null, {
					"type": "quickReplies",
					"_cognigy": {
						"_default": {
							"_quickReplies": {
								"type": "quick_replies",
								"text": outputText,
								"quickReplies": quickReplies
							}
						}
					}
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
	}
});