import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { authenticate } from "../authenticate";
import { generatePresignedGetUrl, extractS3KeyFromCognigyUrl } from "../utils/awsS3Presign";
import axios from "axios";

const ALLOWED_EXTENSIONS = ["pdf", "doc", "docx", "jpeg", "jpg", "png"];

const MIME_TYPES: Record<string, string> = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    jpeg: "image/jpeg",
    jpg: "image/jpeg",
    png: "image/png",
};

interface IAttachment {
    name: string;
    url: string;
    type: string;
}

interface IUploadResult {
    name: string;
    contentDocumentId?: string;
    success: boolean;
    error?: string;
}

export interface IUploadAttachmentToCaseParams extends INodeFunctionBaseParams {
    config: {
        oauthConnection: {
            consumerKey: string;
            consumerSecret: string;
            instanceUrl: string;
        };
        awsConnection: {
            accessKeyId: string;
            secretAccessKey: string;
            region: string;
            bucketName: string;
        };
        caseId: string;
        attachments: IAttachment[];
        maxFileSizeMB: number;
        apiVersion: string;
        storeLocation: string;
        contextKey: string;
        inputKey: string;
    };
}

export const uploadAttachmentToCaseNode = createNodeDescriptor({
    type: "uploadAttachmentToCase",
    defaultLabel: "Upload Attachment to Case",
    summary: "Upload one or more file attachments from the customer session to a Salesforce Case",
    fields: [
        {
            key: "oauthConnection",
            label: "Salesforce Connected App",
            type: "connection",
            params: {
                connectionType: "oauth",
                required: true
            }
        },
        {
            key: "awsConnection",
            label: "AWS S3 Connection",
            type: "connection",
            params: {
                connectionType: "AmazonStorageProvider",
                required: true
            }
        },
        {
            key: "caseId",
            type: "cognigyText",
            label: "Salesforce Case ID (e.g. 5009t00000TKzwHAAT — not the CaseNumber 04295297)",
            defaultValue: "",
            params: {
                required: true
            }
        },
        {
            key: "attachments",
            type: "cognigyText",
            label: "Attachments",
            defaultValue: "{{input.data.attachments}}",
            params: {
                required: true
            }
        },
        {
            key: "maxFileSizeMB",
            type: "number",
            label: "Max File Size (MB)",
            defaultValue: 10,
            params: {
                required: false
            }
        },
        {
            key: "apiVersion",
            type: "cognigyText",
            label: "Salesforce API Version",
            defaultValue: "62.0",
            params: {
                required: false
            }
        },
        {
            key: "storeLocation",
            type: "select",
            label: "Where to store the result",
            defaultValue: "context",
            params: {
                options: [
                    { label: "Input", value: "input" },
                    { label: "Context", value: "context" }
                ],
                required: true
            }
        },
        {
            key: "inputKey",
            type: "text",
            label: "Input Key to store Result",
            defaultValue: "salesforce.attachments",
            condition: {
                key: "storeLocation",
                value: "input"
            }
        },
        {
            key: "contextKey",
            type: "text",
            label: "Context Key to store Result",
            defaultValue: "salesforce.attachments",
            condition: {
                key: "storeLocation",
                value: "context"
            }
        }
    ],
    sections: [
        {
            key: "storage",
            label: "Storage Option",
            defaultCollapsed: true,
            fields: ["storeLocation", "inputKey", "contextKey"]
        },
        {
            key: "advanced",
            label: "Advanced",
            defaultCollapsed: true,
            fields: ["maxFileSizeMB", "apiVersion"]
        }
    ],
    form: [
        { type: "field", key: "oauthConnection" },
        { type: "field", key: "awsConnection" },
        { type: "field", key: "caseId" },
        { type: "field", key: "attachments" },
        { type: "section", key: "advanced" },
        { type: "section", key: "storage" }
    ],
    appearance: {
        color: "#009EDB"
    },
    dependencies: {
        children: [
            "onSuccessUploadAttachment",
            "onPartialSuccessUploadAttachment",
            "onErrorUploadAttachment"
        ]
    },
    function: async ({ cognigy, config, childConfigs }: IUploadAttachmentToCaseParams) => {
        const { api } = cognigy;
        const {
            oauthConnection,
            awsConnection,
            caseId,
            attachments,
            maxFileSizeMB = 10,
            apiVersion = "62.0",
            storeLocation,
            contextKey,
            inputKey
        } = config;

        const storeResult = (output: object) => {
            if (storeLocation === "context") {
                api.addToContext(contextKey, output, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, output);
            }
        };

        if (!attachments || !Array.isArray(attachments) || attachments.length === 0) {
            const onError = childConfigs.find(c => c.type === "onErrorUploadAttachment");
            api.setNextNode(onError.id);
            storeResult({ uploaded: [], errors: [{ name: "unknown", success: false, error: "No attachments found in input.data.attachments" }], totalCount: 0, uploadedCount: 0, errorCount: 1 });
            return;
        }

        let salesforceConnection: any;
        try {
            salesforceConnection = await authenticate(oauthConnection, apiVersion);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : JSON.stringify(err);
            api.log("error", `Salesforce authentication failed: ${errorMessage}`);
            const onError = childConfigs.find(c => c.type === "onErrorUploadAttachment");
            api.setNextNode(onError.id);
            storeResult({ uploaded: [], errors: [{ name: "auth", success: false, error: `Salesforce authentication failed: ${errorMessage}` }], totalCount: 0, uploadedCount: 0, errorCount: 1 });
            return;
        }

        const uploaded: IUploadResult[] = [];
        const errors: IUploadResult[] = [];

        for (const attachment of attachments) {
            const { name, url } = attachment;

            // Validate file extension
            const ext = name?.split(".").pop()?.toLowerCase();
            if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
                errors.push({
                    name,
                    success: false,
                    error: `File type ".${ext || "unknown"}" is not allowed. Accepted types: ${ALLOWED_EXTENSIONS.join(", ")}`
                });
                continue;
            }

            // Extract the S3 object key from the Cognigy files-api URL and generate a presigned URL
            let fetchUrl: string;
            try {
                const objectKey = extractS3KeyFromCognigyUrl(url);
                fetchUrl = generatePresignedGetUrl({
                    accessKeyId: awsConnection.accessKeyId,
                    secretAccessKey: awsConnection.secretAccessKey,
                    region: awsConnection.region,
                    bucket: awsConnection.bucketName,
                    objectKey,
                    expiresInSeconds: 300
                });
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : JSON.stringify(err);
                errors.push({ name, success: false, error: `Failed to generate S3 presigned URL: ${errorMessage}` });
                continue;
            }

            // Fetch file bytes via presigned URL
            let fileBuffer: Buffer;
            try {
                const response = await axios.get(fetchUrl, {
                    responseType: "arraybuffer",
                    timeout: 30000
                });
                fileBuffer = Buffer.from(response.data);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : JSON.stringify(err);
                errors.push({ name, success: false, error: `Failed to fetch file from S3: ${errorMessage}` });
                continue;
            }

            // Validate file size
            const fileSizeMB = fileBuffer.length / (1024 * 1024);
            if (fileSizeMB > maxFileSizeMB) {
                errors.push({
                    name,
                    success: false,
                    error: `File size ${fileSizeMB.toFixed(2)} MB exceeds the ${maxFileSizeMB} MB limit`
                });
                continue;
            }

            // Upload to Salesforce via ContentVersion → ContentDocumentLink
            try {
                const base64Data = fileBuffer.toString("base64");

                // Step 1: Create ContentVersion
                const cvCreateResponse = await salesforceConnection.request({
                    method: "POST",
                    url: `/services/data/v${apiVersion}/sobjects/ContentVersion`,
                    data: {
                        Title: name.replace(/\.[^/.]+$/, ""),
                        PathOnClient: name,
                        VersionData: base64Data,
                        ContentLocation: "S"
                    },
                    headers: { "Content-Type": "application/json" }
                });

                const contentVersionId: string = cvCreateResponse.data.id;

                // Step 2: Get ContentDocumentId from the ContentVersion
                const cvGetResponse = await salesforceConnection.request({
                    method: "GET",
                    url: `/services/data/v${apiVersion}/sobjects/ContentVersion/${contentVersionId}?fields=ContentDocumentId`
                });

                const contentDocumentId: string = cvGetResponse.data.ContentDocumentId;

                // Step 3: Link ContentDocument to the Case
                await salesforceConnection.request({
                    method: "POST",
                    url: `/services/data/v${apiVersion}/sobjects/ContentDocumentLink`,
                    data: {
                        ContentDocumentId: contentDocumentId,
                        LinkedEntityId: caseId,
                        ShareType: "V"
                    },
                    headers: { "Content-Type": "application/json" }
                });

                uploaded.push({ name, contentDocumentId, success: true });

            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : JSON.stringify(err);
                api.log("error", `Salesforce upload failed for "${name}": ${errorMessage}`);
                errors.push({ name, success: false, error: `Salesforce upload failed: ${errorMessage}` });
            }
        }

        const output = {
            uploaded,
            errors,
            totalCount: attachments.length,
            uploadedCount: uploaded.length,
            errorCount: errors.length
        };

        storeResult(output);

        if (uploaded.length > 0 && errors.length === 0) {
            const onSuccess = childConfigs.find(c => c.type === "onSuccessUploadAttachment");
            api.setNextNode(onSuccess.id);
        } else if (uploaded.length > 0 && errors.length > 0) {
            const onPartial = childConfigs.find(c => c.type === "onPartialSuccessUploadAttachment");
            api.setNextNode(onPartial.id);
        } else {
            const onError = childConfigs.find(c => c.type === "onErrorUploadAttachment");
            api.setNextNode(onError.id);
        }
    }
});

export const onSuccessUploadAttachment = createNodeDescriptor({
    type: "onSuccessUploadAttachment",
    parentType: "uploadAttachmentToCase",
    defaultLabel: "All Uploaded",
    constraints: {
        editable: false,
        deletable: false,
        creatable: false,
        movable: false,
        placement: { predecessor: { whitelist: [] } }
    },
    appearance: {
        color: "#61d188",
        textColor: "white",
        variant: "mini",
        showIcon: false
    }
});

export const onPartialSuccessUploadAttachment = createNodeDescriptor({
    type: "onPartialSuccessUploadAttachment",
    parentType: "uploadAttachmentToCase",
    defaultLabel: "Partial Upload",
    constraints: {
        editable: false,
        deletable: false,
        creatable: false,
        movable: false,
        placement: { predecessor: { whitelist: [] } }
    },
    appearance: {
        color: "#f0ad4e",
        textColor: "white",
        variant: "mini",
        showIcon: false
    }
});

export const onErrorUploadAttachment = createNodeDescriptor({
    type: "onErrorUploadAttachment",
    parentType: "uploadAttachmentToCase",
    defaultLabel: "Upload Failed",
    constraints: {
        editable: false,
        deletable: false,
        creatable: false,
        movable: false,
        placement: { predecessor: { whitelist: [] } }
    },
    appearance: {
        color: "#cf142b",
        textColor: "white",
        variant: "mini",
        showIcon: false
    }
});
