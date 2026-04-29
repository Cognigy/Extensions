import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { nocodbApiCall, buildTableRecordsPath, storeResult, validateTableId } from "../helpers/nocodb-utils.js";

export interface IListRecordsParams extends INodeFunctionBaseParams {
    config: {
        connection: { serverUrl: string; apiToken: string };
        tableId: string;
        where?: string;
        sort?: string;
        sortDirection?: "asc" | "desc";
        fields?: string;
        limit?: number;
        offset?: number;
        storeLocation: string;
        storeKey: string;
    };
}

export const listRecordsNode = createNodeDescriptor({
    type: "nocodbListRecords",
    defaultLabel: "List Records",
    summary: "Retrieve records from a NocoDB table with optional filtering, sorting, and pagination",
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
            key: "where",
            label: "Filter (where)",
            type: "cognigyText",
            description: "NocoDB filter expression, e.g., (Status,eq,Active)~and(Age,gt,18)"
        },
        {
            key: "sort",
            label: "Sort Field",
            type: "cognigyText",
            description: "Field name to sort by"
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
            type: "cognigyText",
            description: "Comma-separated field names to include, e.g., Name,Status,Email. Leave empty for all fields."
        },
        {
            key: "limit",
            label: "Limit",
            type: "number",
            defaultValue: 25,
            description: "Number of records to return per page (default 25)"
        },
        {
            key: "offset",
            label: "Offset",
            type: "number",
            defaultValue: 0,
            description: "Number of records to skip for pagination (default 0)"
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
            defaultValue: "nocodbRecords",
            params: { required: true }
        }
    ],
    sections: [
        {
            key: "filterSection",
            label: "Filter & Sort",
            defaultCollapsed: true,
            fields: ["where", "sort", "sortDirection"]
        },
        {
            key: "advancedSection",
            label: "Advanced",
            defaultCollapsed: true,
            fields: ["fields", "limit", "offset"]
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
        { type: "field", key: "tableId" },
        { type: "section", key: "filterSection" },
        { type: "section", key: "advancedSection" },
        { type: "section", key: "outputSection" }
    ],
    appearance: { color: "#4350E7" },
    function: async ({ cognigy, config: rawConfig }: INodeFunctionBaseParams) => {
        const { api } = cognigy;
        const {
            connection, tableId,
            where, sort, sortDirection,
            fields, limit, offset,
            storeLocation, storeKey
        } = rawConfig as IListRecordsParams["config"];

        if (!connection) { throw new Error("List Records: Connection not found"); }
        validateTableId(tableId, "List Records");

        const params = new URLSearchParams();
        if (where) { params.append("where", where); }
        if (sort) {
            const sortParam = sortDirection === "desc" ? `-${sort}` : sort;
            params.append("sort", sortParam);
        }
        if (fields) { params.append("fields", fields); }
        if (limit !== undefined && limit !== null) { params.append("limit", String(Math.max(1, limit))); }
        if (offset !== undefined && offset !== null && offset > 0) { params.append("offset", String(offset)); }

        const basePath = buildTableRecordsPath(tableId);
        const queryString = params.toString();
        const path = queryString ? `${basePath}?${queryString}` : basePath;

        api.log?.("info", `NocoDB List Records: GET ${connection.serverUrl}${path}`);

        try {
            const data = await nocodbApiCall(connection.serverUrl, connection.apiToken, "GET", path);
            storeResult(api, storeLocation, storeKey, data);
            api.log?.("info", `NocoDB List Records: Stored ${data?.list?.length ?? 0} records under ${storeLocation}.${storeKey}`);
        } catch (error: any) {
            api.log?.("error", `NocoDB List Records Error: ${error.message}`);
            api.addToContext?.("nocodbError", error.message, "simple");
            throw error;
        }
    }
});
