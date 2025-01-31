import {
  createNodeDescriptor,
  INodeFunctionBaseParams,
} from "@cognigy/extension-tools";
import axios from "axios";

export interface IUpdateTicketParams extends INodeFunctionBaseParams {
  config: {
    connectionType: string,
    userConnection: {
      username: string,
      password: string,
      subdomain: string,
    },
    apiTokenConnection: {
      emailAddress: string,
      apiToken: string,
      subdomain: string,
    },
    ticketId: number,
    ticket: any,
    storeLocation: string,
    contextKey: string,
    inputKey: string,
  };
}
export const updateTicketNode = createNodeDescriptor({
  type: "updateTicket",
  defaultLabel: {
    default: "Update Ticket",
    deDE: "Bearbeite Ticket",
    esES: "Actualizar Ticket",
  },
  summary: {
    default: "Updates a given ticket in zendesk",
    deDE: "Bearbeitet ein bestimmtes Ticket in Zendesk",
    esES: "Actualiza un ticket determinado en Zendesk",
  },
  fields: [
    {
      key: "connectionType",
      label: {
        default: "Connection Type",
        deDE: "Verbindungstyp",
        esES: "Tipo de conexión",
      },
      type: "select",
      defaultValue: "user",
      params: {
        required: true,
        options: [
          {
            label: "API Token",
            value: "apiToken",
          },
          {
            label: "User",
            value: "user",
          },
        ],
      },
    },
    {
      key: "userConnection",
      label: {
        default: "Zendesk Connection",
        deDE: "Zendesk Verbindung",
        esES: "Zendesk Conexión",
      },
      type: "connection",
      params: {
        connectionType: "zendesk",
        required: true,
      },
      condition: {
        key: "connectionType",
        value: "user",
      },
    },
    {
      key: "apiTokenConnection",
      label: {
        default: "Zendesk API Token Connection",
      },
      type: "connection",
      params: {
        connectionType: "zendesk-api-token",
        required: true,
      },
      condition: {
        key: "connectionType",
        value: "apiToken",
      },
    },
    {
      key: "ticketId",
      label: "Ticket ID",
      type: "cognigyText",
      description: {
        default: "The ID of the support ticket",
        deDE: "Die ID des Support Tickets",
        esES: "La identificación del ticket de soporte",
      },
      params: {
        required: true,
      },
    },
    {
      key: "ticket",
      label: {
        default: "Ticket Data",
        deDE: "Ticket Daten",
        esES: "Datos del ticket",
      },
      type: "json",
      description: {
        default: "The JSON of the ticket to update",
        deDE: "Die JSON Daten des zu bearbeitenden Tickets",
        esES: "La JSON del ticket a actualizar",
      },
      params: {
        required: true,
      },
      defaultValue: `{
	"ticket": {
		"comment": {
			"body": "Thanks for choosing Acme Jet Motors.",
				"public": true
		},
		"status": "solved"
	}
}
			`,
    },
    {
      key: "storeLocation",
      type: "select",
      label: {
        default: "Where to store the result",
        deDE: "Wo das Ergebnis gespeichert werden soll",
        esES: "Dónde almacenar el resultado",
      },
      defaultValue: "input",
      params: {
        options: [
          {
            label: "Input",
            value: "input",
          },
          {
            label: "Context",
            value: "context",
          },
        ],
        required: true,
      },
    },
    {
      key: "inputKey",
      type: "cognigyText",
      label: {
        default: "Input Key to store Result",
        deDE: "Input Key zum Speichern des Ergebnisses",
        esES: "Input Key para almacenar el resultado",
      },
      defaultValue: "zendesk.updated",
      condition: {
        key: "storeLocation",
        value: "input",
      },
    },
    {
      key: "contextKey",
      type: "cognigyText",
      label: {
        default: "Context Key to store Result",
        deDE: "Context Key zum Speichern des Ergebnisses",
        esES: "Context Key para almacenar el resultado",
      },
      defaultValue: "zendesk.updated",
      condition: {
        key: "storeLocation",
        value: "context",
      },
    },
  ],
  sections: [
    {
      key: "storage",
      label: {
        default: "Storage Option",
        deDE: "Speicheroption",
        esES: "Opción de almacenamiento",
      },
      defaultCollapsed: true,
      fields: ["storeLocation", "inputKey", "contextKey"],
    },
  ],
  form: [
    { type: "field", key: "connectionType" },
    { type: "field", key: "userConnection" },
    { type: "field", key: "apiTokenConnection" },   
    { type: "field", key: "ticketId" },
    { type: "field", key: "ticket" },
    { type: "section", key: "storage" },
  ],
  appearance: {
    color: "#00363d",
  },
  function: async ({ cognigy, config }: IUpdateTicketParams) => {
    const { api } = cognigy;
    const {
      ticketId,
      ticket,
      userConnection,
      apiTokenConnection,
      connectionType,
      storeLocation,
      contextKey,
      inputKey,
    } = config;

    const { username, password, subdomain: userSubdomain } = userConnection;
    const {
      emailAddress,
      apiToken,
      subdomain: tokenSubdomain,
    } = apiTokenConnection;

    const subdomain =
      connectionType === "apiToken" ? tokenSubdomain : userSubdomain;

    try {
      const response = await axios({
        method: "put",
        url: `https://${subdomain}.zendesk.com/api/v2/tickets/${ticketId}`,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        data: ticket,
		auth: {
			username:
			  connectionType === "apiToken" ? `${emailAddress}/token` : username,
			password: connectionType === "apiToken" ? apiToken : password,
		  }
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
  },
});
