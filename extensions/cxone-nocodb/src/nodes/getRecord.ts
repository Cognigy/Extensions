import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { nocodbApiCall, buildTableRecordsPath, storeResult, validateTableId } from "../helpers/nocodb-utils.js";

export interface IGetRecordParams extends INodeFunctionBaseParams {
    config: {
        connection: { serverUrl: string; apiToken: string };
        tableId: string;
        rowId: string;
        storeLocation: string;
        storeKey: string;
    };
}

export const getRecordNode = createNodeDescriptor({
    type: "nocodbGetRecord",
    defaultLabel: "Get Record",
    summary: "Retrieve a single NocoDB record by its row ID",
    preview: { key: "rowId", type: "text" },
    fields: [
        {
            key: "connection",
            label: "NocoDB Connection",
            type: "connection",
            params: { connectionType: "nocodbConnection", required: true }
        },
        {
            key: "tableId",
            label: "Table ID",
            type: "cognigyText",
            params: { required: true },
            description: "NocoDB table ID, e.g., md_xxxxxxxxxxxx"
        },
        {
            key: "rowId",
            label: "Row ID",
            type: "cognigyText",
            params: { required: true },
            description: "The row's primary key value, e.g., 1"
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
            defaultValue: "nocodbRecord",
            params: { required: true }
        }
    ],
    form: [
        { type: "field", key: "connection" },
        { type: "field", key: "tableId" },
        { type: "field", key: "rowId" },
        { type: "field", key: "storeLocation" },
        { type: "field", key: "storeKey" }
    ],
    appearance: { color: "#4350E7" },
    function: async ({ cognigy, config: rawConfig }: INodeFunctionBaseParams) => {
        const { api } = cognigy;
        const { connection, tableId, rowId, storeLocation, storeKey } = rawConfig as IGetRecordParams["config"];

        if (!connection) { throw new Error("Get Record: Connection not found"); }
        validateTableId(tableId, "Get Record");
        if (!rowId) { throw new Error("Get Record: Row ID is required"); }

        const path = buildTableRecordsPath(tableId, rowId);
        api.log?.("info", `NocoDB Get Record: GET ${connection.serverUrl}${path}`);

        try {
            const data = await nocodbApiCall(connection.serverUrl, connection.apiToken, "GET", path);
            storeResult(api, storeLocation, storeKey, data);
            api.log?.("info", `NocoDB Get Record: Stored record ${rowId} under ${storeLocation}.${storeKey}`);
        } catch (error: any) {
            api.log?.("error", `NocoDB Get Record Error: ${error.message}`);
            api.addToContext?.("nocodbError", error.message, "simple");
            throw error;
        }
    }
});
