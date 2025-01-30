import {
  createNodeDescriptor,
  INodeFunctionBaseParams,
} from "@cognigy/extension-tools";
import axios from "axios";

export interface ICreateTicketParams extends INodeFunctionBaseParams {
  config: {
    connectionType: string;
    userConnection: {
      username: string;
      password: string;
      subdomain: string;
    };
    apiTokenConnection: {
      emailAddress: string;
      apiToken: string;
      subdomain: string;
    };
    subject: string;
    description: string;
    priority: string;
    storeLocation: string;
    contextKey: string;
    inputKey: string;
    specifyRequester: boolean;
    requesterName: string;
    requesterEmail: string;
    requesterLocaleId: string;
    specifyBrand: boolean;
    brandId: string;
    useCustomFields: boolean;
    customFields: string;
    addTags: boolean;
    tags: string;
  };
}
export const createTicketNode = createNodeDescriptor({
  type: "createTicket",
  defaultLabel: {
    default: "Create Ticket",
    deDE: "Ticket erstellen",
    esES: "Crear Ticket",
  },
  summary: {
    default: "Creates a new support ticket",
    deDE: "Erstellt ein neues Support Ticket",
    esES: "Crea un nuevo ticket de soporte",
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
      key: "subject",
      label: {
        default: "Subject",
        deDE: "Betreff",
        esES: "Tema",
      },
      type: "cognigyText",
      description: {
        default: "The subject of the new support ticket",
        deDE: "Der Betreff des neuen Tickets",
        esES: "El tema del nuevo ticket de soporte",
      },
      params: {
        required: true,
      },
    },
    {
      key: "description",
      label: {
        default: "Description",
        deDE: "Beschreibung",
        esES: "Descripción",
      },
      type: "cognigyText",
      description: {
        default: "The description of the new support ticket",
        deDE: "Die Beschreibung des neuen Tickets",
        esES: "La descripción del nuevo ticket de soporte",
      },
      params: {
        required: true,
      },
    },
    {
      key: "priority",
      label: {
        default: "Priority",
        deDE: "Priorität",
        esES: "Prioridad",
      },
      type: "select",
      description: {
        default: "The priority of the new support ticket",
        deDE: "Die Priorität des neuen Tickets",
        esES: "La prioridad del nuevo ticket de soporte",
      },
      defaultValue: "normal",
      params: {
        required: true,
        options: [
          {
            label: "Normal",
            value: "normal",
          },
          {
            label: "High",
            value: "high",
          },
          {
            label: "Urgent",
            value: "urgent",
          },
        ],
      },
    },
    {
      key: "specifyRequester",
      type: "toggle",
      label: {
        default: "Specify Requester Information",
        deDE: "Requester information angeben",
        esES: "Especificar información del solicitante",
      },
      description: {
        default: "Specify requester information for a new or existing user",
        deDE: "Ergänze Ticket mit Requesterinformation für einen neuen oder existierenden Nutzer",
        esES: "Especifique la información del solicitante para un usuario nuevo o existente",
      },
      defaultValue: false,
    },
    {
      key: "requesterName",
      label: {
        default: "Name of requester",
        deDE: "Name des Requesters",
        esES: "Nombre del solicitante",
      },
      type: "cognigyText",
      params: {
        required: false,
      },
    },
    {
      key: "requesterEmail",
      label: {
        default: "Requester Email",
        deDE: "Email des Requesters",
        esES: "Correo electrónico del solicitante",
      },
      type: "cognigyText",
      params: {
        required: false,
      },
    },
    {
      key: "requesterLocaleId",
      label: {
        default: "Requester Locale ID",
        deDE: "Locale ID des Requesters",
        esES: "ID de configuración regional del solicitante",
      },
      type: "cognigyText",
      params: {
        required: false,
      },
    },
    {
      key: "specifyBrand",
      type: "toggle",
      label: {
        default: "Specify Brand ID",
        deDE: "Brand ID angeben",
        esES: "Especificar ID de marca",
      },
      description: {
        default: "Specify for which brand the ticket is being created.",
        deDE: "Gebe an für welche Brand die Ticket erstellt worden ist.",
        esES: "Especificar para qué marca se está creando el ticket.",
      },
      defaultValue: false,
    },
    {
      key: "brandId",
      label: {
        default: "Brand ID",
        deDE: "Brand ID",
        esES: "Identificación de la marca",
      },
      type: "cognigyText",
      params: {
        required: false,
      },
      condition: {
        key: "specifyBrand",
        value: true,
      },
    },
    {
      key: "useCustomFields",
      type: "toggle",
      label: {
        default: "Use Custom Fields",
        deDE: "Custom Fields benutzen",
        esES: "Usar campos personalizados",
      },
      description: {
        default:
          "Add an array custom fields from your specific brand to your ticket.",
        deDE: "Ergänze Ticket mit einem Custom-Fields-Array.",
        esES: "Agregue campos personalizados de su marca específica a su ticket.",
      },
      defaultValue: false,
    },
    {
      key: "customFields",
      label: {
        default: "Custom Fields",
        deDE: "Custom Fields",
        esES: "campos personalizados",
      },
      type: "json",
      params: {
        required: false,
      },
      defaultValue: [{ id: 12345678, value: "loremipsum" }],
      condition: {
        key: "useCustomFields",
        value: true,
      },
    },
    {
      key: "addTags",
      type: "toggle",
      label: {
        default: "Add tags",
        deDE: "Tags ergänzen",
        esES: "Agregar etiquetas",
      },
      description: {
        default: "Add an array of tags to the ticket.",
        deDE: "Ergänze Ticket mit einem Tags-Array.",
        esES: "Agregue una serie de etiquetas al ticket.",
      },
      defaultValue: false,
    },
    {
      key: "tags",
      label: {
        default: "Tags",
        deDE: "Tags",
        esES: "Etiquetas",
      },
      type: "json",
      params: {
        required: false,
      },
      defaultValue: ["enterprise", "other_tag"],
      condition: {
        key: "addTags",
        value: true,
      },
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
      defaultValue: "zendesk.ticket",
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
      defaultValue: "zendesk.ticket",
      condition: {
        key: "storeLocation",
        value: "context",
      },
    },
  ],
  sections: [
    {
      key: "requesterInformation",
      label: {
        default: "Requester Information",
        deDE: "Requesterinformation",
        esES: "Información del solicitante",
      },
      defaultCollapsed: true,
      fields: [
        "specifyRequester",
        "requesterName",
        "requesterEmail",
        "requesterLocaleId",
      ],
    },
    {
      key: "additionalOptions",
      label: {
        default: "Additional Ticket Options",
        deDE: "Zusätzliche Ticketoptionen",
        esES: "Opciones de ticket adicionales",
      },
      defaultCollapsed: true,
      fields: [
        "specifyBrand",
        "brandId",
        "useCustomFields",
        "customFields",
        "addTags",
        "tags",
      ],
    },
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
    { type: "field", key: "subject" },
    { type: "field", key: "description" },
    { type: "field", key: "priority" },
    { type: "section", key: "requesterInformation" },
    { type: "section", key: "additionalOptions" },
    { type: "section", key: "storage" },
  ],
  appearance: {
    color: "#00363d",
  },
  function: async ({ cognigy, config }: ICreateTicketParams) => {
    const { api } = cognigy;
    const {
      userConnection,
      apiTokenConnection,
      connectionType,
      description,
      priority,
      subject,
      specifyRequester,
      requesterName,
      requesterEmail,
      requesterLocaleId,
      specifyBrand,
      brandId,
      useCustomFields,
      customFields,
      addTags,
      tags,
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

    let data = {
      ticket: {
        comment: {
          body: description,
        },
        priority,
        subject,
      },
    };
    if (specifyRequester === true) {
      data.ticket["requester"] = {
        locale_id: requesterLocaleId,
        name: requesterName,
        email: requesterEmail,
      };
    }
    if (specifyBrand === true) {
      data.ticket["brand_id"] = brandId;
    }
    if (useCustomFields === true) {
      data.ticket["custom_fields"] = customFields;
    }
    if (addTags === true) {
      data.ticket["tags"] = tags;
    }

    try {
      const response = await axios({
        method: "post",
        url: `https://${subdomain}.zendesk.com/api/v2/tickets`,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        data: data,
        auth: {
          username:
            connectionType === "apiToken" ? `${emailAddress}/token` : username,
          password: connectionType === "apiToken" ? apiToken : password,
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
  },
});
