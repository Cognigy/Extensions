import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { airtableApiCall, buildRecordUrl, storeResult, validateBaseId } from "../helpers/airtable-utils.js";

export interface IDeleteRecordsParams extends INodeFunctionBaseParams {
    config: {
        connection: { personalAccessToken: string };
        baseId: string;
        tableIdOrName: string;
        recordIds: any;
        storeLocation: string;
        storeKey: string;
    };
}

export const deleteRecordsNode = createNodeDescriptor({
    type: "airtableDeleteRecords",
    defaultLabel: "Delete Records",
    summary: "Delete one or more AirTable records by their IDs (max 10 per call)",
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
            key: "recordIds",
            label: "Record IDs",
            type: "json",
            params: { required: true },
            description: "Single ID string \"recXXX\" or array of up to 10 IDs: [\"recXXX\", \"recYYY\"]"
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
            defaultValue: "airtableDeleted",
            params: { required: true }
        }
    ],
    form: [
        { type: "field", key: "connection" },
        { type: "field", key: "baseId" },
        { type: "field", key: "tableIdOrName" },
        { type: "field", key: "recordIds" },
        { type: "field", key: "storeLocation" },
        { type: "field", key: "storeKey" }
    ],
    appearance: { color: "#FCB400" },
    function: async ({ cognigy, config: rawConfig }: INodeFunctionBaseParams) => {
        const { api } = cognigy;
        const { connection, baseId, tableIdOrName, recordIds, storeLocation, storeKey } = rawConfig as IDeleteRecordsParams["config"];

        if (!connection) { throw new Error("Delete Records: Connection not found"); }
        validateBaseId(baseId, "Delete Records");
        if (!recordIds) { throw new Error("Delete Records: Record IDs are required"); }

        // Normalize: accept a single ID string or an array
        const idsArray: string[] = Array.isArray(recordIds) ? recordIds : [recordIds];
        if (idsArray.length === 0) {
            throw new Error("Delete Records: At least one Record ID is required");
        }
        if (idsArray.length > 10) {
            throw new Error("Delete Records: Maximum 10 records can be deleted per call");
        }

        const baseUrl = buildRecordUrl(baseId, tableIdOrName);
        const params = new URLSearchParams();
        idsArray.forEach((id: string) => params.append("records[]", id));
        // URLSearchParams encodes brackets (%5B/%5D); AirTable requires literal brackets for array params
        const url = `${baseUrl}?${params.toString().replace(/%5B/gi, "[").replace(/%5D/gi, "]")}`;

        api.log?.("info", `AirTable Delete Records: DELETE ${baseUrl} (${idsArray.length} record(s))`);

        try {
            const data = await airtableApiCall(connection.personalAccessToken, "DELETE", url);
            storeResult(api, storeLocation, storeKey, data);
            api.log?.("info", `AirTable Delete Records: Deleted ${data?.records?.length ?? 0} record(s)`);
        } catch (error: any) {
            api.log?.("error", `AirTable Delete Records Error: ${error.message}`);
            api.addToContext?.("airtableError", error.message, "simple");
            throw error;
        }
    }
});
