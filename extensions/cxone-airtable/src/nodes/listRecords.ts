import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { airtableApiCall, buildRecordUrl, storeResult, validateBaseId } from "../helpers/airtable-utils.js";

export interface IListRecordsParams extends INodeFunctionBaseParams {
    config: {
        connection: { personalAccessToken: string };
        baseId: string;
        tableIdOrName: string;
        filterByFormula?: string;
        view?: string;
        sortField?: string;
        sortDirection?: "asc" | "desc";
        fields?: string[];
        maxRecords?: number;
        pageSize?: number;
        offset?: string;
        storeLocation: string;
        storeKey: string;
    };
}

export const listRecordsNode = createNodeDescriptor({
    type: "airtableListRecords",
    defaultLabel: "List Records",
    summary: "Retrieve records from an AirTable table with optional filtering, sorting, and pagination",
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
            key: "filterByFormula",
            label: "Filter by Formula",
            type: "cognigyText",
            description: "AirTable formula to filter records, e.g., {Status} = 'Active' or AND({Age} > 18, {Country} = 'US')"
        },
        {
            key: "view",
            label: "View",
            type: "cognigyText",
            description: "Name or ID of a table view — applies the view's filter and sort settings"
        },
        {
            key: "sortField",
            label: "Sort Field",
            type: "cognigyText",
            description: "Field name to sort records by"
        },
        {
            key: "sortDirection",
            label: "Sort Direction",
            type: "select",
            defaultValue: "asc",
            params: {
                options: [
                    { label: "Ascending", value: "asc" },
                    { label: "Descending", value: "desc" }
                ]
            }
        },
        {
            key: "fields",
            label: "Return Fields",
            type: "json",
            description: "JSON array of field names to include, e.g., [\"Name\", \"Status\"]. Leave empty for all fields."
        },
        {
            key: "maxRecords",
            label: "Max Records",
            type: "number",
            description: "Maximum total number of records to return across all pages"
        },
        {
            key: "pageSize",
            label: "Page Size",
            type: "number",
            defaultValue: 100,
            description: "Number of records per page (1-100, default 100)"
        },
        {
            key: "offset",
            label: "Pagination Offset",
            type: "cognigyText",
            description: "Offset token from a previous response to retrieve the next page of results"
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
            defaultValue: "airtableRecords",
            params: { required: true }
        }
    ],
    sections: [
        {
            key: "filterSection",
            label: "Filter & Sort",
            defaultCollapsed: true,
            fields: ["filterByFormula", "view", "sortField", "sortDirection"]
        },
        {
            key: "advancedSection",
            label: "Advanced",
            defaultCollapsed: true,
            fields: ["fields", "maxRecords", "pageSize", "offset"]
        },
        {
            key: "outputSection",
            label: "Output",
            defaultCollapsed: false,
            fields: ["storeLocation", "storeKey"]
        }
    ],
    form: [
        { type: "field", key: "connection" },
        { type: "field", key: "baseId" },
        { type: "field", key: "tableIdOrName" },
        { type: "section", key: "filterSection" },
        { type: "section", key: "advancedSection" },
        { type: "section", key: "outputSection" }
    ],
    appearance: { color: "#FCB400" },
    function: async ({ cognigy, config: rawConfig }: INodeFunctionBaseParams) => {
        const { api } = cognigy;
        const {
            connection, baseId, tableIdOrName,
            filterByFormula, view, sortField, sortDirection,
            fields, maxRecords, pageSize, offset,
            storeLocation, storeKey
        } = rawConfig as IListRecordsParams["config"];

        if (!connection) { throw new Error("List Records: Connection not found"); }
        validateBaseId(baseId, "List Records");

        const baseUrl = buildRecordUrl(baseId, tableIdOrName);
        const params = new URLSearchParams();

        if (filterByFormula) { params.append("filterByFormula", filterByFormula); }
        if (view) { params.append("view", view); }
        if (sortField) {
            params.append("sort[0][field]", sortField);
            params.append("sort[0][direction]", sortDirection ?? "asc");
        }
        if (Array.isArray(fields) && fields.length > 0) {
            fields.forEach((f: string) => params.append("fields[]", f));
        }
        if (maxRecords) { params.append("maxRecords", String(maxRecords)); }
        if (pageSize) { params.append("pageSize", String(Math.max(1, Math.min(pageSize, 100)))); }
        if (offset) { params.append("offset", offset); }

        // URLSearchParams encodes brackets (%5B/%5D); AirTable requires literal brackets for array params
        const queryString = params.toString().replace(/%5B/gi, "[").replace(/%5D/gi, "]");
        const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;

        api.log?.("info", `AirTable List Records: GET ${url}`);

        try {
            const data = await airtableApiCall(connection.personalAccessToken, "GET", url);
            storeResult(api, storeLocation, storeKey, data);
            api.log?.("info", `AirTable List Records: Stored ${data?.records?.length ?? 0} records under ${storeLocation}.${storeKey}`);
        } catch (error: any) {
            api.log?.("error", `AirTable List Records Error: ${error.message}`);
            api.addToContext?.("airtableError", error.message, "simple");
            throw error;
        }
    }
});
