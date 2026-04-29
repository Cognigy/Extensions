import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { nocodbApiCall, buildTableRecordsPath, storeResult, validateTableId } from "../helpers/nocodb-utils.js";

export interface IUpdateRecordsParams extends INodeFunctionBaseParams {
    config: {
        connection: { serverUrl: string; apiToken: string };
        tableId: string;
        records: any;
        storeLocation: string;
        storeKey: string;
    };
}

export const updateRecordsNode = createNodeDescriptor({
    type: "nocodbUpdateRecords",
    defaultLabel: "Update Records",
    summary: "Update one or more existing NocoDB records by their row IDs",
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
            key: "records",
            label: "Records",
            type: "json",
            params: { required: true },
            description: "Single record with Id: {\"Id\": 1, \"Status\": \"Done\"} or array: [{\"Id\": 1, \"Status\": \"Done\"}, {\"Id\": 2, \"Status\": \"Pending\"}]"
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
            defaultValue: "nocodbUpdated",
            params: { required: true }
        }
    ],
    form: [
        { type: "field", key: "connection" },
        { type: "field", key: "tableId" },
        { type: "field", key: "records" },
        { type: "field", key: "storeLocation" },
        { type: "field", key: "storeKey" }
    ],
    appearance: { color: "#4350E7" },
    function: async ({ cognigy, config: rawConfig }: INodeFunctionBaseParams) => {
        const { api } = cognigy;
        const { connection, tableId, records, storeLocation, storeKey } = rawConfig as IUpdateRecordsParams["config"];

        if (!connection) { throw new Error("Update Records: Connection not found"); }
        validateTableId(tableId, "Update Records");
        if (!records) { throw new Error("Update Records: Records data is required"); }

        // Normalize: accept a single record object or an array
        const recordsArray = Array.isArray(records) ? records : [records];
        if (recordsArray.length === 0) {
            throw new Error("Update Records: Records array must not be empty");
        }

        const path = buildTableRecordsPath(tableId);
        // NocoDB accepts single object or array — pass array when multiple records
        const body = recordsArray.length === 1 ? recordsArray[0] : recordsArray;

        api.log?.("info", `NocoDB Update Records: PATCH ${connection.serverUrl}${path} (${recordsArray.length} record(s))`);

        try {
            const data = await nocodbApiCall(connection.serverUrl, connection.apiToken, "PATCH", path, body);
            storeResult(api, storeLocation, storeKey, data);
            api.log?.("info", `NocoDB Update Records: Updated ${Array.isArray(data) ? data.length : 1} record(s) in table ${tableId}`);
        } catch (error: any) {
            api.log?.("error", `NocoDB Update Records Error: ${error.message}`);
            api.addToContext?.("nocodbError", error.message, "simple");
            throw error;
        }
    }
});
