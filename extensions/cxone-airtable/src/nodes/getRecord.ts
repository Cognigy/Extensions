import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { airtableApiCall, buildRecordUrl, storeResult, validateBaseId } from "../helpers/airtable-utils.js";

export interface IGetRecordParams extends INodeFunctionBaseParams {
    config: {
        connection: { personalAccessToken: string };
        baseId: string;
        tableIdOrName: string;
        recordId: string;
        storeLocation: string;
        storeKey: string;
    };
}

export const getRecordNode = createNodeDescriptor({
    type: "airtableGetRecord",
    defaultLabel: "Get Record",
    summary: "Retrieve a single AirTable record by its ID",
    preview: { key: "recordId", type: "text" },
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
            key: "recordId",
            label: "Record ID",
            type: "cognigyText",
            params: { required: true },
            description: "The AirTable record ID, e.g., recXXXXXXXXXXXXXX"
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
            defaultValue: "airtableRecord",
            params: { required: true }
        }
    ],
    form: [
        { type: "field", key: "connection" },
        { type: "field", key: "baseId" },
        { type: "field", key: "tableIdOrName" },
        { type: "field", key: "recordId" },
        { type: "field", key: "storeLocation" },
        { type: "field", key: "storeKey" }
    ],
    appearance: { color: "#FCB400" },
    function: async ({ cognigy, config: rawConfig }: INodeFunctionBaseParams) => {
        const { api } = cognigy;
        const { connection, baseId, tableIdOrName, recordId, storeLocation, storeKey } = rawConfig as IGetRecordParams["config"];

        if (!connection) { throw new Error("Get Record: Connection not found"); }
        validateBaseId(baseId, "Get Record");
        if (!recordId) { throw new Error("Get Record: Record ID is required"); }

        const url = buildRecordUrl(baseId, tableIdOrName, recordId);
        api.log?.("info", `AirTable Get Record: GET ${url}`);

        try {
            const data = await airtableApiCall(connection.personalAccessToken, "GET", url);
            storeResult(api, storeLocation, storeKey, data);
            api.log?.("info", `AirTable Get Record: Stored record ${recordId} under ${storeLocation}.${storeKey}`);
        } catch (error: any) {
            api.log?.("error", `AirTable Get Record Error: ${error.message}`);
            api.addToContext?.("airtableError", error.message, "simple");
            throw error;
        }
    }
});
