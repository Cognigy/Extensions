import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { createClient } from '@supabase/supabase-js';

export interface IListParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            supabaseUrl: string;
            supabaseKey: string;
        }
        bucket: string;
        limit: number;
        offset: number;
        useSort: boolean;
        sortColumn: string;
        sortOrder: string;
        storeLocation: string;
        contextKey: string;
        inputKey: string;
    };
}
export const listNode = createNodeDescriptor({
    type: "list",
    defaultLabel: "List Files (Storage)",
    summary: "Lists all files within a bucket",
    fields: [
        {
            key: "connection",
            label: "Supabase Connection",
            type: "connection",
            params: {
                connectionType: "supabase",
                required: true
            }
        },
        {
            key: "bucket",
            label: "Bucket",
            type: "cognigyText",
            description: "The name of the storage bucket",
            params: {
                required: true
            }
        },
        {
            key: "limit",
            label: "Limit",
            type: "number",
            description: "How many files should be returned",
            defaultValue: 100
        },
        {
            key: "offset",
            label: "Offset",
            type: "number",
            defaultValue: 0
        },
        {
            key: "useSort",
            label: "Sort Files",
            type: "toggle",
            description: "Whether to sort the result or not",
            defaultValue: false
        },
        {
            key: "sortColumn",
            label: "Column",
            type: "cognigyText",
            description: "The name of the column that should be used for sorting the result",
            condition: {
                key: "useSort",
                value: true
            }
        },
        {
            key: "sortOrder",
            label: "Order Type",
            type: "select",
            description: "The order type that should be used",
            condition: {
                key: "useSort",
                value: true
            },
            params: {
                options: [
                    {
                        label: "Ascending",
                        value: "asc"
                    },
                    {
                        label: "Descanding",
                        value: "desc"
                    }
                ]
            }
        },
        {
            key: "storeLocation",
            type: "select",
            label: "Where to store the result",
            defaultValue: "input",
            params: {
                options: [
                    {
                        label: "Input",
                        value: "input"
                    },
                    {
                        label: "Context",
                        value: "context"
                    }
                ],
                required: true
            },
        },
        {
            key: "inputKey",
            type: "cognigyText",
            label: "Input Key to store Result",
            defaultValue: "storage",
            condition: {
                key: "storeLocation",
                value: "input",
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: "Context Key to store Result",
            defaultValue: "storage",
            condition: {
                key: "storeLocation",
                value: "context",
            }
        },
    ],
    sections: [
        {
            key: "storage",
            label: "Storage Option",
            defaultCollapsed: true,
            fields: [
                "storeLocation",
                "inputKey",
                "contextKey",
            ]
        },
        {
            key: "advanced",
            label: "Advanced",
            defaultCollapsed: true,
            fields: [
                "limit",
                "offset",
                "useSort",
                "sortColumn",
                "sortOrder"
            ]
        }
    ],
    form: [
        { type: "field", key: "connection" },
        { type: "field", key: "bucket" },
        { type: "section", key: "advanced" },
        { type: "section", key: "storage" }
    ],
    appearance: {
        color: "#266f4e"
    },
    function: async ({ cognigy, config }: IListParams) => {
        const { api } = cognigy;
        const { connection, bucket, limit, offset, useSort, sortColumn, sortOrder, storeLocation, contextKey, inputKey } = config;
        const { supabaseKey, supabaseUrl } = connection;

        try {

            const supabase = createClient(supabaseUrl, supabaseKey);

            if (useSort) {
                const { data, error } = await supabase
                    .storage
                    .from(bucket)
                    .list(undefined, {
                        limit,
                        offset,
                        sortBy: {
                            column: sortColumn,
                            order: sortOrder
                        },
                    });

                if (storeLocation === "context") {
                    api.addToContext(contextKey, data, "simple");
                } else {
                    // @ts-ignore
                    api.addToInput(inputKey, data);
                }
            } else {
                const { data, error } = await supabase
                    .storage
                    .from(bucket)
                    .list(undefined, {
                        limit,
                        offset
                    });

                if (storeLocation === "context") {
                    api.addToContext(contextKey, data, "simple");
                } else {
                    // @ts-ignore
                    api.addToInput(inputKey, data);
                }
            }

        } catch (error) {
            if (storeLocation === "context") {
                api.addToContext(contextKey, { error: error }, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, { error: error });
            }
        }
    }
});