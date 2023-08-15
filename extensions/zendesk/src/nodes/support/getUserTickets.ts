import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from "axios";

export interface IGetUserTicketsParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			username: string;
			password: string;
			subdomain: string;
		};
		email: string;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const getUserTicketsNode = createNodeDescriptor({
	type: "getUserTicketsNode",
	defaultLabel: {
		default: "Get User Tickets",
		deDE: "Erhalte Nutzer Tickets",
		esES: "Obtener Tickets"
	},
	summary: {
		default: "Retrieves the information about user tickets",
		deDE: "Erhält alle Infos über Nutzer Tickets",
		esES: "Recupera la información sobre tickets"
	},
	fields: [
		{
			key: "connection",
			label: {
				default: "Zendesk Connection",
				deDE: "Zendesk Verbindung",
				esES: "Zendesk Conexión"
			},
			type: "connection",
			params: {
				connectionType: "zendesk",
				required: true
			}
		},
		{
			key: "email",
            label: {
				default: "Email Address",
				deDE: "E-Mail Adresse",
                esES: "Dirección de correo electrónico"
			},
			type: "cognigyText",
            defaultValue: "{{profile.email}}",
            description: {
                default: "The requester's email address",
                deDE: "Die E-Mail Adresse der Nutzerin",
                esES: "La dirección de correo electrónico del usuario"
            },
			params: {
				required: true,
			},
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
			defaultValue: "zendesk.ticket",
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
			defaultValue: "zendesk.ticket",
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
		{ type: "field", key: "email" },
		{ type: "section", key: "storage" },
	],
	appearance: {
		color: "#00363d"
	},
	dependencies: {
		children: [
			"onFoundUserTickets",
			"onNotFoundUserTickets"
		]
	},
	function: async ({ cognigy, config, childConfigs }: IGetUserTicketsParams) => {
		const { api } = cognigy;
		const { email, connection, storeLocation, contextKey, inputKey } = config;
		const { username, password, subdomain } = connection;

		try {

			const response = await axios({
				method: "get",
				url: `https://${subdomain}.zendesk.com/api/v2/search.json?query=type:ticket requester:${email}`,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				auth: {
					username,
					password
				}
			});

			const onSuccessChild = childConfigs.find(child => child.type === "onFoundUserTickets");
			api.setNextNode(onSuccessChild.id);

			if (storeLocation === "context") {
				api.addToContext(contextKey, response.data.results, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, response.data.results);
			}
		} catch (error) {

			const onErrorChild = childConfigs.find(child => child.type === "onNotFoundUserTickets");
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

export const onFoundUserTickets = createNodeDescriptor({
	type: "onFoundUserTickets",
	parentType: "getUserTicketsNode",
	defaultLabel: {
		default: "On Found",
		deDE: "Tickets gefunden",
		esES: "Encontre"
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

export const onNotFoundUserTickets = createNodeDescriptor({
	type: "onNotFoundUserTickets",
	parentType: "getUserTicketsNode",
	defaultLabel: {
		default: "On Not Found",
		deDE: "Keine Tickets gefunden",
		esES: "Nada Encontrado"
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

