import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { airtableApiCall, buildMetaTablesUrl, storeResult, validateBaseId } from "../helpers/airtable-utils.js";

export interface IListTablesParams extends INodeFunctionBaseParams {
    config: {
        connection: { personalAccessToken: string };
        baseId: string;
        storeLocation: string;
        storeKey: string;
    };
}

export const listTablesNode = createNodeDescriptor({
    type: "airtableListTables",
    defaultLabel: "List Tables",
    summary: "Retrieve schema and metadata of all tables in an AirTable base",
    preview: { key: "baseId", type: "text" },
    fields: [
        {
            key: "connection",
            label: "AirTable Connection",
            type: "connection",
            params: { connectionType: "airtableConnection", required: true }
        },
        {
            key: "baseId",
            label: "Base ID",
            type: "cognigyText",
            params: { required: true },
            description: "AirTable Base ID, e.g., appXXXXXXXXXXXXXX"
        },
        {
            key: "storeLocation",
            label: "Store Result In",
            type: "select",
            defaultValue: "context",
            params: {
                options: [
                    { label: "Context", value: "context" },
                    { label: "Input", value: "input" }
                ]
            }
        },
        {
            key: "storeKey",
            label: "Store Key",
            type: "cognigyText",
            defaultValue: "airtableTables",
            params: { required: true }
        }
    ],
    form: [
        { type: "field", key: "connection" },
        { type: "field", key: "baseId" },
        { type: "field", key: "storeLocation" },
        { type: "field", key: "storeKey" }
    ],
    appearance: { color: "#FCB400" },
    function: async ({ cognigy, config: rawConfig }: INodeFunctionBaseParams) => {
        const { api } = cognigy;
        const { connection, baseId, storeLocation, storeKey } = rawConfig as IListTablesParams["config"];

        if (!connection) { throw new Error("List Tables: Connection not found"); }
        validateBaseId(baseId, "List Tables");

        const url = buildMetaTablesUrl(baseId);
        api.log?.("info", `AirTable List Tables: GET ${url}`);

        try {
            const data = await airtableApiCall(connection.personalAccessToken, "GET", url);
            storeResult(api, storeLocation, storeKey, data);
            api.log?.("info", `AirTable List Tables: Stored ${data?.tables?.length ?? 0} tables under ${storeLocation}.${storeKey}`);
        } catch (error: any) {
            api.log?.("error", `AirTable List Tables Error: ${error.message}`);
            api.addToContext?.("airtableError", error.message, "simple");
            throw error;
        }
    }
});
