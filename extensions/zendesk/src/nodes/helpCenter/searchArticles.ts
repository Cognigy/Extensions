import {
  createNodeDescriptor,
  INodeFunctionBaseParams,
} from "@cognigy/extension-tools";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

export interface ISearchArticlesParams extends INodeFunctionBaseParams {
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
    query: number,
    storeLocation: string,
    contextKey: string,
    inputKey: string,
    useBrandId: boolean,
    brandId: string,
    useLocale: boolean,
    locale: string,
    useFreeTextQuery: boolean,
    freeTextQuery: string,
  };
}
export const searchArticlesNode = createNodeDescriptor({
  type: "searchArticles",
  defaultLabel: {
    default: "Search Articles",
    deDE: "Suche Artikel",
    esES: "Buscar Artículos",
  },
  summary: {
    default: "Searches for Help Center articles based on a search query",
    deDE: "Durchsucht das Help Center nach passenden Artikeln zu einer Suchanfrage",
    esES: "Busca artículos del centro de ayuda según una consulta de búsqueda",
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
      key: "query",
      label: {
        default: "Search Query",
        deDE: "Suchanfrage",
        esES: "Consulta de búsqueda",
      },
      type: "cognigyText",
      description: {
        default:
          "The search query that is used in order to find help center articles",
        deDE: "Die Suchanfrage welche verwendet werden soll",
        esES: "La consulta de búsqueda que se utiliza para encontrar artículos del centro de ayuda.",
      },
      params: {
        required: false,
      },
    },
    {
      key: "useBrandId",
      type: "toggle",
      label: {
        default: "Use Brand ID",
        deDE: "Brand ID benutzen",
        esES: "Usar identificación de marca",
      },
      description: {
        default: "Should the Brand ID be used for the search query?",
        deDE: "Soll die Brand ID für die Suchanfrage verwendet werden?",
        esES: "¿Debe utilizarse el ID de marca para la consulta de búsqueda?",
      },
      defaultValue: false,
    },
    {
      key: "brandId",
      label: {
        default: "Brand ID",
        deDE: "Brand ID",
        esES: "Brand ID",
      },
      type: "cognigyText",
      description: {
        default: "The Brand ID for this search query.",
        deDE: "Die Brand ID für diese Suchanfrage.",
        esES: "El ID de marca para esta consulta de búsqueda.",
      },
      params: {
        required: false,
      },
      condition: {
        key: "useBrandId",
        value: true,
      },
    },
    {
      key: "useLocale",
      type: "toggle",
      label: {
        default: "Use Locale",
        deDE: "Locale benutzen",
        esES: "Usar configuración regional",
      },
      description: {
        default: "Should the locale be used for the query?",
        deDE: "Soll die Locale für die Suchanfrage verwendet werden?",
        esES: "¿Se debe usar la configuración regional para la consulta?",
      },
      defaultValue: false,
    },
    {
      key: "locale",
      label: {
        default: "Locale",
        deDE: "Locale",
        esES: "Locale",
      },
      type: "cognigyText",
      description: {
        default: "The locale for this search query.",
        deDE: "Die locale für diese Suchanfrage.",
        esES: "La configuración regional para esta consulta de búsqueda.",
      },
      params: {
        required: false,
      },
      condition: {
        key: "useLocale",
        value: true,
      },
    },
    {
      key: "useFreeTextQuery",
      type: "toggle",
      label: {
        default: "Use Free Text Query",
        deDE: "Freitext Suchanfrage benutzen",
        esES: "Usar consulta de texto libre",
      },
      description: {
        default: "Use a free text field for the search query.",
        deDE: "Freitext für die Suchanfrage benutzen.",
        esES: "Utilice un campo de texto libre para la consulta de búsqueda.",
      },
      defaultValue: false,
      condition: {
        and: [
          {
            key: "useBrandId",
            value: false,
          },
          {
            key: "useLocale",
            value: false,
          },
        ],
      },
    },
    {
      key: "freeTextQuery",
      label: {
        default: "Free Text Query",
        deDE: "Freitextanfrage",
        esES: "Consulta de texto libre",
      },
      type: "cognigyText",
      description: {
        default:
          "Free text query for the search. For example: query=bild&locale=de,en-us",
        deDE: "Freitextanfrage für die Suche. Zum Beispiel: query=bild&locale=de,en-us",
        esES: "Consulta de texto libre para la búsqueda. Por ejemplo: query=bild&locale=de,en-us",
      },
      params: {
        required: false,
      },
      condition: {
        and: [
          {
            key: "useBrandId",
            value: false,
          },
          {
            key: "useLocale",
            value: false,
          },
          {
            key: "useFreeTextQuery",
            value: true,
          },
        ],
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
      defaultValue: "zendesk.articles",
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
      defaultValue: "zendesk.articles",
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
    { type: "field", key: "connection" },
    { type: "field", key: "query" },
    { type: "field", key: "useBrandId" },
    { type: "field", key: "brandId" },
    { type: "field", key: "useLocale" },
    { type: "field", key: "locale" },
    { type: "field", key: "useFreeTextQuery" },
    { type: "field", key: "freeTextQuery" },
    { type: "section", key: "storage" },
  ],
  appearance: {
    color: "#00363d",
  },
  dependencies: {
    children: ["onFoundArticles", "onNotFoundArticles"],
  },
  function: async ({
    cognigy,
    config,
    childConfigs,
  }: ISearchArticlesParams) => {
    const { api } = cognigy;
    const {
      query,
      userConnection,
      apiTokenConnection,
      connectionType,
      storeLocation,
      useBrandId,
      brandId,
      useLocale,
      locale,
      useFreeTextQuery,
      freeTextQuery,
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

    let endpoint = `https://${subdomain}.zendesk.com/api/v2/help_center/articles/search`;
    let searchParameters;
    if (useBrandId === true && useLocale === false) {
      searchParameters = {
        query: query,
        brand_id: brandId,
      };
    } else if (useBrandId === false && useLocale === true) {
      searchParameters = {
        query: query,
        locale: locale,
      };
    } else if (useBrandId === true && useLocale === true) {
      searchParameters = {
        query: query,
        locale: locale,
        brand_id: brandId,
      };
    } else if (
      useBrandId === false &&
      useLocale === false &&
      useFreeTextQuery === false
    ) {
      searchParameters = {
        query: query,
      };
    } else if (useFreeTextQuery === true) {
      endpoint = `https://${subdomain}.zendesk.com/api/v2/help_center/articles/search?${freeTextQuery}`;
    }

    const axiosConfig: AxiosRequestConfig = {
      params: searchParameters,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      auth: {
        username:
          connectionType === "apiToken" ? `${emailAddress}/token` : username,
        password: connectionType === "apiToken" ? apiToken : password,
      },
    };

    try {
      const response: AxiosResponse = await axios.get(endpoint, axiosConfig);

      if (response.data?.results?.length === 0) {
        const onErrorChild = childConfigs.find(
          (child) => child.type === "onNotFoundArticles"
        );
        api.setNextNode(onErrorChild.id);

        if (storeLocation === "context") {
          api.addToContext(contextKey, response.data.results, "simple");
        } else {
          // @ts-ignore
          api.addToInput(inputKey, response.data.results);
        }
      } else {
        const onSuccessChild = childConfigs.find(
          (child) => child.type === "onFoundArticles"
        );
        api.setNextNode(onSuccessChild.id);

        if (storeLocation === "context") {
          api.addToContext(contextKey, response.data?.results, "simple");
        } else {
          // @ts-ignore
          api.addToInput(inputKey, response.data?.results);
        }
      }
    } catch (error) {
      const onErrorChild = childConfigs.find(
        (child) => child.type === "onNotFoundArticles"
      );
      api.setNextNode(onErrorChild.id);

      if (storeLocation === "context") {
        api.addToContext(contextKey, { error: error.message }, "simple");
      } else {
        // @ts-ignore
        api.addToInput(inputKey, { error: error.message });
      }
    }
  },
});

export const onFoundArticles = createNodeDescriptor({
  type: "onFoundArticles",
  parentType: "searchArticles",
  defaultLabel: {
    default: "On Found",
    deDE: "Artikel gefunden",
    esES: "Encontrado",
  },
  constraints: {
    editable: false,
    deletable: false,
    creatable: false,
    movable: false,
    placement: {
      predecessor: {
        whitelist: [],
      },
    },
  },
  appearance: {
    color: "#61d188",
    textColor: "white",
    variant: "mini",
  },
});

export const onNotFoundArticles = createNodeDescriptor({
  type: "onNotFoundArticles",
  parentType: "searchArticles",
  defaultLabel: {
    default: "On Not Found",
    deDE: "Keine Artikel gefunden",
    esES: "Nada Encontrado",
  },
  constraints: {
    editable: false,
    deletable: false,
    creatable: false,
    movable: false,
    placement: {
      predecessor: {
        whitelist: [],
      },
    },
  },
  appearance: {
    color: "#61d188",
    textColor: "white",
    variant: "mini",
  },
});
