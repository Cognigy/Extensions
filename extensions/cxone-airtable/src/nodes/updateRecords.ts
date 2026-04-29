import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { airtableApiCall, buildRecordUrl, storeResult, validateBaseId } from "../helpers/airtable-utils.js";

export interface IUpdateRecordsParams extends INodeFunctionBaseParams {
    config: {
        connection: { personalAccessToken: string };
        baseId: string;
        tableIdOrName: string;
        records: any;
        performUpsert?: boolean;
        fieldsToMergeOn?: string[];
        typecast?: boolean;
        storeLocation: string;
        storeKey: string;
    };
}

export const updateRecordsNode = createNodeDescriptor({
    type: "airtableUpdateRecords",
    defaultLabel: "Update Records",
    summary: "Partially update (PATCH) one or more existing AirTable records",
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
            description: "Array of records with IDs: [{\"id\": \"recXXX\", \"fields\": {\"Status\": \"Done\"}}]. For upsert, omit the id field."
        },
        {
            key: "performUpsert",
            label: "Perform Upsert",
            type: "toggle",
            defaultValue: false,
            description: "Create records that do not exist, matching by the specified merge fields"
        },
        {
            key: "fieldsToMergeOn",
            label: "Upsert Match Fields",
            type: "json",
            description: "Field names used to identify existing records for upsert, e.g., [\"Email\"]",
            condition: { key: "performUpsert", value: true }
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
            defaultValue: "airtableUpdated",
            params: { required: true }
        }
    ],
    form: [
        { type: "field", key: "connection" },
        { type: "field", key: "baseId" },
        { type: "field", key: "tableIdOrName" },
        { type: "field", key: "records" },
        { type: "field", key: "performUpsert" },
        { type: "field", key: "fieldsToMergeOn" },
        { type: "field", key: "typecast" },
        { type: "field", key: "storeLocation" },
        { type: "field", key: "storeKey" }
    ],
    appearance: { color: "#FCB400" },
    function: async ({ cognigy, config: rawConfig }: INodeFunctionBaseParams) => {
        const { api } = cognigy;
        const {
            connection, baseId, tableIdOrName, records,
            performUpsert, fieldsToMergeOn, typecast,
            storeLocation, storeKey
        } = rawConfig as IUpdateRecordsParams["config"];

        if (!connection) { throw new Error("Update Records: Connection not found"); }
        validateBaseId(baseId, "Update Records");
        if (!records) { throw new Error("Update Records: Records data is required"); }

        const url = buildRecordUrl(baseId, tableIdOrName);
        const recordsArray = Array.isArray(records) ? records : [records];
        if (recordsArray.length === 0) {
            throw new Error("Update Records: Records array must not be empty");
        }
        if (recordsArray.length > 10) {
            throw new Error("Update Records: Maximum 10 records can be updated per call");
        }

        if (performUpsert && (!Array.isArray(fieldsToMergeOn) || fieldsToMergeOn.length === 0)) {
            throw new Error("Update Records: Upsert Match Fields are required when Perform Upsert is enabled");
        }

        const body: Record<string, any> = { records: recordsArray };
        if (performUpsert) {
            body.performUpsert = { fieldsToMergeOn };
        }
        if (typecast) { body.typecast = true; }

        api.log?.("info", `AirTable Update Records: PATCH ${url} (${recordsArray.length} record(s))`);

        try {
            const data = await airtableApiCall(connection.personalAccessToken, "PATCH", url, body);
            storeResult(api, storeLocation, storeKey, data);
            api.log?.("info", `AirTable Update Records: Updated ${data?.records?.length ?? 0} record(s)`);
        } catch (error: any) {
            api.log?.("error", `AirTable Update Records Error: ${error.message}`);
            api.addToContext?.("airtableError", error.message, "simple");
            throw error;
        }
    }
});
