import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { createClient } from '@supabase/supabase-js';

export interface IGetPublicURLParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            supabaseUrl: string;
            supabaseKey: string;
        }
        bucket: string;
        path: string;
        storeLocation: string;
        contextKey: string;
        inputKey: string;
    };
}
export const getPublicURLNode = createNodeDescriptor({
    type: "getPublicURL",
    defaultLabel: "Get Public URL (Storage)",
    summary: "Retrieve URLs for assets in public buckets",
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
            label: "Public Bucket",
            type: "cognigyText",
            description: "The name of the public storage bucket",
            params: {
                required: true
            }
        },
        {
            key: "path",
            label: "Path",
            type: "cognigyText",
            description: "The path of the file that should be downloaded",
            defaultValue: "folder/subfolder/filename.png",
            params: {
                required: true
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
        }
    ],
    form: [
        { type: "field", key: "connection" },
        { type: "field", key: "bucket" },
        { type: "field", key: "path" },
        { type: "section", key: "storage" }
    ],
    appearance: {
        color: "#266f4e"
    },
    function: async ({ cognigy, config }: IGetPublicURLParams) => {
        const { api } = cognigy;
        const { connection, bucket, path, storeLocation, contextKey, inputKey } = config;
        const { supabaseKey, supabaseUrl } = connection;

        try {

            const supabase = createClient(supabaseUrl, supabaseKey);

            const { publicURL, error } = supabase
                .storage
                .from(bucket)
                .getPublicUrl(path);


            if (storeLocation === "context") {
                api.addToContext(contextKey, publicURL, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, publicURL);
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