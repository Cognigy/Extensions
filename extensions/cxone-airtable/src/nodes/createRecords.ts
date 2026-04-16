import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { airtableApiCall, buildRecordUrl, storeResult, validateBaseId } from "../helpers/airtable-utils.js";

export interface ICreateRecordsParams extends INodeFunctionBaseParams {
    config: {
        connection: { personalAccessToken: string };
        baseId: string;
        tableIdOrName: string;
        records: any;
        typecast?: boolean;
        storeLocation: string;
        storeKey: string;
    };
}

export const createRecordsNode = createNodeDescriptor({
    type: "airtableCreateRecords",
    defaultLabel: "Create Records",
    summary: "Create one or more records in an AirTable table",
    preview: { key: "tableIdOrName", type: "text" },
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
            key: "tableIdOrName",
            label: "Table ID or Name",
            type: "cognigyText",
            params: { required: true },
            description: "Table name (e.g., Contacts) or table ID (tblXXXXXXXXXXXXXX)"
        },
        {
            key: "records",
            label: "Records",
            type: "json",
            params: { required: true },
            description: "Single record: {\"fields\": {\"Name\": \"Alice\"}} or array of up to 10: [{\"fields\": {\"Name\": \"Alice\"}}, {\"fields\": {\"Name\": \"Bob\"}}]"
        },
        {
            key: "typecast",
            label: "Typecast",
            type: "toggle",
            defaultValue: false,
            description: "Automatically convert string values to the appropriate AirTable field type"
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
            defaultValue: "airtableCreated",
            params: { required: true }
        }
    ],
    form: [
        { type: "field", key: "connection" },
        { type: "field", key: "baseId" },
        { type: "field", key: "tableIdOrName" },
        { type: "field", key: "records" },
        { type: "field", key: "typecast" },
        { type: "field", key: "storeLocation" },
        { type: "field", key: "storeKey" }
    ],
    appearance: { color: "#FCB400" },
    function: async ({ cognigy, config: rawConfig }: INodeFunctionBaseParams) => {
        const { api } = cognigy;
        const { connection, baseId, tableIdOrName, records, typecast, storeLocation, storeKey } = rawConfig as ICreateRecordsParams["config"];

        if (!connection) { throw new Error("Create Records: Connection not found"); }
        validateBaseId(baseId, "Create Records");
        if (!records) { throw new Error("Create Records: Records data is required"); }

        const url = buildRecordUrl(baseId, tableIdOrName);

        // Normalize: accept a single record object or an array
        const recordsArray = Array.isArray(records) ? records : [records];
        if (recordsArray.length === 0) {
            throw new Error("Create Records: Records array must not be empty");
        }
        if (recordsArray.length > 10) {
            throw new Error("Create Records: Maximum 10 records can be created per call");
        }
        const body: Record<string, any> = { records: recordsArray };
        if (typecast) { body.typecast = true; }

        api.log?.("info", `AirTable Create Records: POST ${url} (${recordsArray.length} record(s))`);

        try {
            const data = await airtableApiCall(connection.personalAccessToken, "POST", url, body);
            storeResult(api, storeLocation, storeKey, data);
            api.log?.("info", `AirTable Create Records: Created ${data?.records?.length ?? 0} record(s)`);
        } catch (error: any) {
            api.log?.("error", `AirTable Create Records Error: ${error.message}`);
            api.addToContext?.("airtableError", error.message, "simple");
            throw error;
        }
    }
});
