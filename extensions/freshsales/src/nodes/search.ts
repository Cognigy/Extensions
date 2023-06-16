import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from "axios";

export interface ISearchParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			key: string;
			subdomain: string;
		};
		type: string;
		query: string;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const searchNode = createNodeDescriptor({
	type: "search",
	defaultLabel: {
		default: "Search",
		deDE: "Suchen"
	},
	summary: {
		default: "Searches for info in CRM",
		deDE: "Sucht nach Infos im CRM"
	},
	fields: [
		{
			key: "connection",
			label: {
				default: "Freshsales Connection",
				deDE: "Freshsales Verbindung"
			},
			type: "connection",
			params: {
				connectionType: "freshsales-apikey",
				required: true
			}
		},
		{
			key: "type",
			label: {
				default: "Type",
				deDE: "Art"
			},
			type: "select",
			defaultValue: "contact",
			description: {
				default: "The type of the search result",
				deDE: "Die Art des Suchergebnis"
			},
			params: {
				required: true,
				options: [
					{
						label: {
							default: "Contact",
							deDE: "Kontakt"
						},
						value: "contact"
					},
					{
						label: {
							default: "User",
							deDE: "Nutzer"
						},
						value: "user"
					},
					{
						label: {
							default: "Deal",
							deDE: "Deal"
						},
						value: "deal"
					},
					{
						label: {
							default: "Sales Account",
							deDE: "Vertriebsaccount"
						},
						value: "sales_account"
					}
				]
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
			description: {
				default: "The search query of the user",
				deDE: "Die Suchanfrage der Nutzerin"
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
				deDE: "Wo das Ergebnis gespeichert werden soll",
				esES: "Dónde almacenar el resultado"
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
				deDE: "Input Key zum Speichern des Ergebnisses",
				esES: "Input Key para almacenar el resultado"
			},
			defaultValue: "freshsales",
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
				deDE: "Context Key zum Speichern des Ergebnisses",
				esES: "Context Key para almacenar el resultado"
			},
			defaultValue: "freshsales",
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
				deDE: "Speicheroption",
				esES: "Opción de almacenamiento"
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
		{ type: "field", key: "type" },
		{ type: "field", key: "query" },
		{ type: "section", key: "storage" },
	],
	appearance: {
		color: "#e67300"
	},
	dependencies: {
		children: [
			"onFound",
			"onNotFound"
		]
	},
	function: async ({ cognigy, config, childConfigs }: ISearchParams) => {
		const { api } = cognigy;
		const { connection, type, query, storeLocation, contextKey, inputKey } = config;
		const { key, subdomain } = connection;

		try {

			const response = await axios({
				method: "get",
				url: `https://${subdomain}.myfreshworks.com/crm/sales/api/search?q=${encodeURIComponent(query)}&include=${type}`,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json",
					"Authorization": `Token token=${key}`
				},
			});

			if (response.data.length !== 0) {
				const onSuccessChild = childConfigs.find(child => child.type === "onFound");
				api.setNextNode(onSuccessChild.id);
			} else {
				const onErrorChild = childConfigs.find(child => child.type === "onNotFound");
				api.setNextNode(onErrorChild.id);
			}

			if (storeLocation === "context") {
				api.addToContext(contextKey, response.data, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, response.data);
			}
		} catch (error) {

			const onErrorChild = childConfigs.find(child => child.type === "onNotFound");
			api.setNextNode(onErrorChild.id);

			if (storeLocation === "context") {
				api.addToContext(contextKey, { error: error.message }, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, { error: error.message });
			}
		}
	}
});

export const onFound = createNodeDescriptor({
	type: "onFound",
	parentType: "search",
	defaultLabel: {
		default: "On Found",
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

export const onNotFound = createNodeDescriptor({
	type: "onNotFound",
	parentType: "search",
	defaultLabel: {
		default: "Not Found",
		deDE: "Nichts gefunden"
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

