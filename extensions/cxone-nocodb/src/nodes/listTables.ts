import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { nocodbApiCall, buildMetaTablesPath, storeResult, validateBaseId } from "../helpers/nocodb-utils.js";

export interface IListTablesParams extends INodeFunctionBaseParams {
    config: {
        connection: { serverUrl: string; apiToken: string };
        baseId: string;
        storeLocation: string;
        storeKey: string;
    };
}

export const listTablesNode = createNodeDescriptor({
    type: "nocodbListTables",
    defaultLabel: "List Tables",
    summary: "Retrieve metadata of all tables in a NocoDB base",
    preview: { key: "baseId", type: "text" },
    fields: [
        {
            key: "connection",
            label: "NocoDB Connection",
            type: "connection",
            params: { connectionType: "nocodbConnection", required: true }
        },
        {
            key: "baseId",
            label: "Base ID",
            type: "cognigyText",
            params: { required: true },
            description: "NocoDB base (project) ID, e.g., p_xxxxxxxxxxxx"
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
            defaultValue: "nocodbTables",
            params: { required: true }
        }
    ],
    form: [
        { type: "field", key: "connection" },
        { type: "field", key: "baseId" },
        { type: "field", key: "storeLocation" },
        { type: "field", key: "storeKey" }
    ],
    appearance: { color: "#4350E7" },
    function: async ({ cognigy, config: rawConfig }: INodeFunctionBaseParams) => {
        const { api } = cognigy;
        const { connection, baseId, storeLocation, storeKey } = rawConfig as IListTablesParams["config"];

        if (!connection) { throw new Error("List Tables: Connection not found"); }
        validateBaseId(baseId, "List Tables");

        const path = buildMetaTablesPath(baseId);
        api.log?.("info", `NocoDB List Tables: GET ${connection.serverUrl}${path}`);

        try {
            const data = await nocodbApiCall(connection.serverUrl, connection.apiToken, "GET", path);
            storeResult(api, storeLocation, storeKey, data);
            api.log?.("info", `NocoDB List Tables: Stored ${data?.list?.length ?? 0} tables under ${storeLocation}.${storeKey}`);
        } catch (error: any) {
            api.log?.("error", `NocoDB List Tables Error: ${error.message}`);
            api.addToContext?.("nocodbError", error.message, "simple");
            throw error;
        }
    }
});
