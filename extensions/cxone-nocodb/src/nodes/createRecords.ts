import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { nocodbApiCall, buildTableRecordsPath, storeResult, validateTableId } from "../helpers/nocodb-utils.js";

export interface ICreateRecordsParams extends INodeFunctionBaseParams {
    config: {
        connection: { serverUrl: string; apiToken: string };
        tableId: string;
        records: any;
        storeLocation: string;
        storeKey: string;
    };
}

export const createRecordsNode = createNodeDescriptor({
    type: "nocodbCreateRecords",
    defaultLabel: "Create Records",
    summary: "Create one or more records in a NocoDB table",
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
            description: "Single record: {\"Name\": \"Alice\"} or array: [{\"Name\": \"Alice\"}, {\"Name\": \"Bob\"}]"
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
            defaultValue: "nocodbCreated",
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
        const { connection, tableId, records, storeLocation, storeKey } = rawConfig as ICreateRecordsParams["config"];

        if (!connection) { throw new Error("Create Records: Connection not found"); }
        validateTableId(tableId, "Create Records");
        if (!records) { throw new Error("Create Records: Records data is required"); }

        // Normalize: accept a single record object or an array
        const recordsArray = Array.isArray(records) ? records : [records];
        if (recordsArray.length === 0) {
            throw new Error("Create Records: Records array must not be empty");
        }

        const path = buildTableRecordsPath(tableId);
        // NocoDB accepts single object or array — pass array when multiple records
        const body = recordsArray.length === 1 ? recordsArray[0] : recordsArray;

        api.log?.("info", `NocoDB Create Records: POST ${connection.serverUrl}${path} (${recordsArray.length} record(s))`);

        try {
            const data = await nocodbApiCall(connection.serverUrl, connection.apiToken, "POST", path, body);
            storeResult(api, storeLocation, storeKey, data);
            api.log?.("info", `NocoDB Create Records: Created ${Array.isArray(data) ? data.length : 1} record(s) in table ${tableId}`);
        } catch (error: any) {
            api.log?.("error", `NocoDB Create Records Error: ${error.message}`);
            api.addToContext?.("nocodbError", error.message, "simple");
            throw error;
        }
    }
});
