import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { createClient } from '@supabase/supabase-js';

export interface IInsertParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            supabaseUrl: string;
            supabaseKey: string;
        }
        table: string;
        rowsData: any[];
        storeLocation: string;
        contextKey: string;
        inputKey: string;
    };
}
export const insertNode = createNodeDescriptor({
    type: "insert",
    defaultLabel: "Insert",
    summary: "Insert a new row to a database table",
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
            key: "table",
            label: "table",
            type: "cognigyText",
            description: "The name of the database table",
            params: {
                required: true
            }
        },
        {
            key: "rowsData",
            label: "Rows Data",
            type: "json",
            description: "The list of JSON objects containing the row data",
            defaultValue: "[{}]"
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
            defaultValue: "database",
            condition: {
                key: "storeLocation",
                value: "input",
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: "Context Key to store Result",
            defaultValue: "database",
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
        }
    ],
    form: [
        { type: "field", key: "connection" },
        { type: "field", key: "table" },
        { type: "field", key: "rowsData" },
        { type: "section", key: "storage" }
    ],
    appearance: {
        color: "#266f4e"
    },
    function: async ({ cognigy, config }: IInsertParams) => {
        const { api } = cognigy;
        const { connection, table, rowsData, storeLocation, contextKey, inputKey } = config;
        const { supabaseKey, supabaseUrl } = connection;

        try {

            const supabase = createClient(supabaseUrl, supabaseKey);

            const { data, error } = await supabase
                .from(table)
                .insert(rowsData);

            if (storeLocation === "context") {
                api.addToContext(contextKey, data, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, data);
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