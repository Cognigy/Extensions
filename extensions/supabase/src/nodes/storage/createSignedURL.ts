import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { createClient } from '@supabase/supabase-js';

export interface ICreateSignedURLParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            supabaseUrl: string;
            supabaseKey: string;
        }
        bucket: string;
        path: string;
        expiresIn: number;
        storeLocation: string;
        contextKey: string;
        inputKey: string;
    };
}
export const createSignedURLNode = createNodeDescriptor({
    type: "createSignedURL",
    defaultLabel: "Create Signed URL (Storage)",
    summary: "Create signed url to download file without requiring permissions",
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
            key: "expiresIn",
            label: "Expires In",
            type: "number",
            description: "The number of seconds until the signed URL expires",
            defaultValue: 60
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
                "expiresIn"
            ]
        }
    ],
    form: [
        { type: "field", key: "connection" },
        { type: "field", key: "bucket" },
        { type: "field", key: "path" },
        { type: "section", key: "advanced" },
        { type: "section", key: "storage" }
    ],
    appearance: {
        color: "#266f4e"
    },
    function: async ({ cognigy, config }: ICreateSignedURLParams) => {
        const { api } = cognigy;
        const { connection, bucket, path, expiresIn, storeLocation, contextKey, inputKey } = config;
        const { supabaseKey, supabaseUrl } = connection;

        try {

            const supabase = createClient(supabaseUrl, supabaseKey);

            const { signedURL, error } = await supabase
                .storage
                .from(bucket)
                .createSignedUrl(path, expiresIn);


            if (storeLocation === "context") {
                api.addToContext(contextKey, signedURL, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, signedURL);
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