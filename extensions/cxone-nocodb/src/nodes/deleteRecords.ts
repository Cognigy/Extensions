import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { nocodbApiCall, buildTableRecordsPath, storeResult, validateTableId } from "../helpers/nocodb-utils.js";

export interface IDeleteRecordsParams extends INodeFunctionBaseParams {
    config: {
        connection: { serverUrl: string; apiToken: string };
        tableId: string;
        recordIds: any;
        storeLocation: string;
        storeKey: string;
    };
}

export const deleteRecordsNode = createNodeDescriptor({
    type: "nocodbDeleteRecords",
    defaultLabel: "Delete Records",
    summary: "Delete one or more NocoDB records by their row IDs",
    preview: { key: "tableId", type: "text" },
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
            key: "recordIds",
            label: "Record IDs",
            type: "json",
            params: { required: true },
            description: "Single ID: 1 or array: [1, 2, 3]. Each ID is the row's primary key value."
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
            defaultValue: "nocodbDeleted",
            params: { required: true }
        }
    ],
    form: [
        { type: "field", key: "connection" },
        { type: "field", key: "tableId" },
        { type: "field", key: "recordIds" },
        { type: "field", key: "storeLocation" },
        { type: "field", key: "storeKey" }
    ],
    appearance: { color: "#4350E7" },
    function: async ({ cognigy, config: rawConfig }: INodeFunctionBaseParams) => {
        const { api } = cognigy;
        const { connection, tableId, recordIds, storeLocation, storeKey } = rawConfig as IDeleteRecordsParams["config"];

        if (!connection) { throw new Error("Delete Records: Connection not found"); }
        validateTableId(tableId, "Delete Records");
        if (recordIds === undefined || recordIds === null) {
            throw new Error("Delete Records: Record IDs are required");
        }

        // Normalize: accept a single ID (number/string) or an array
        // NocoDB DELETE body expects array of objects with Id field: [{Id: 1}, {Id: 2}]
        const idsRaw: any[] = Array.isArray(recordIds) ? recordIds : [recordIds];
        if (idsRaw.length === 0) {
            throw new Error("Delete Records: At least one Record ID is required");
        }

        // Wrap plain IDs into {Id: value} objects if needed
        const body = idsRaw.map((id: any) => (typeof id === "object" && id !== null ? id : { Id: id }));

        const path = buildTableRecordsPath(tableId);
        api.log?.("info", `NocoDB Delete Records: DELETE ${connection.serverUrl}${path} (${body.length} record(s))`);

        try {
            const data = await nocodbApiCall(connection.serverUrl, connection.apiToken, "DELETE", path, body);
            storeResult(api, storeLocation, storeKey, data);
            api.log?.("info", `NocoDB Delete Records: Deleted ${body.length} record(s) from table ${tableId}`);
        } catch (error: any) {
            api.log?.("error", `NocoDB Delete Records Error: ${error.message}`);
            api.addToContext?.("nocodbError", error.message, "simple");
            throw error;
        }
    }
});
