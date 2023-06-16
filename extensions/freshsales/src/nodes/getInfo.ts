import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from "axios";

export interface IGetInfoParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			key: string;
			subdomain: string;
		};
		type: string;
		id: string;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const getInfoNode = createNodeDescriptor({
	type: "getInfo",
	defaultLabel: {
		default: "Get Info",
		deDE: "Erhalte Infos"
	},
	summary: {
		default: "Get information for contact, accounts or deals",
		deDE: "Gibt Infos zu Kontakten, Accounts oder Deals zurück"
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
			defaultValue: "contacts",
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
						value: "contacts"
					},
					{
						label: {
							default: "Deal",
							deDE: "Deal"
						},
						value: "deals"
					},
					{
						label: {
							default: "Sales Account",
							deDE: "Vertriebsaccount"
						},
						value: "sales_accounts"
					}
				]
			}
		},
		{
			key: "id",
			label: {
				default: "ID",
				deDE: "ID"
			},
			type: "cognigyText",
			defaultValue: "{{input.freshsales[0].id}}",
			description: {
				default: "The id of the contact, account or deal",
				deDE: "Die ID des Kontakts, Accounts oder Deals"
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
		{ type: "field", key: "id" },
		{ type: "section", key: "storage" },
	],
	appearance: {
		color: "#e67300"
	},
	function: async ({ cognigy, config }: IGetInfoParams) => {
		const { api } = cognigy;
		const { connection, type, id, storeLocation, contextKey, inputKey } = config;
		const { key, subdomain } = connection;

		try {

			const response = await axios({
				method: "get",
				url: `https://${subdomain}.myfreshworks.com/crm/sales/api/${type}/${id}`,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json",
					"Authorization": `Token token=${key}`
				},
			});

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
		}
	}
});