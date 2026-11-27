import { IConnectionSchema } from "@cognigy/extension-tools";

export const awsS3Connection: IConnectionSchema = {
    type: "AmazonStorageProvider",
    label: "AWS S3 Connection",
    fields: [
        { fieldName: "accessKeyId" },
        { fieldName: "secretAccessKey" },
        { fieldName: "region" },
        { fieldName: "bucketName" }
    ]
};
