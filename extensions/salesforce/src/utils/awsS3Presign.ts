import * as crypto from "crypto";

interface IPresignOptions {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    bucket: string;
    objectKey: string;
    expiresInSeconds?: number;
}

function hmac(key: Buffer | string, data: string): Buffer {
    return crypto.createHmac("sha256", key).update(data, "utf8").digest();
}

function sha256Hex(data: string): string {
    return crypto.createHash("sha256").update(data, "utf8").digest("hex");
}

function getSigningKey(secretKey: string, dateStamp: string, region: string): Buffer {
    const kDate = hmac("AWS4" + secretKey, dateStamp);
    const kRegion = hmac(kDate, region);
    const kService = hmac(kRegion, "s3");
    return hmac(kService, "aws4_request");
}

/**
 * Generates a presigned GET URL for an S3 object using AWS Signature V4.
 * Allows the extension to fetch private S3 objects without making them public.
 */
export function generatePresignedGetUrl(options: IPresignOptions): string {
    const { accessKeyId, secretAccessKey, region, bucket, objectKey, expiresInSeconds = 300 } = options;

    const now = new Date();
    const dateTime = now.toISOString().replace(/[:\-]|\.\d{3}/g, "").slice(0, 15) + "Z";
    const dateStamp = dateTime.slice(0, 8);

    const host = `${bucket}.s3.${region}.amazonaws.com`;
    const credentialScope = `${dateStamp}/${region}/s3/aws4_request`;
    const credential = `${accessKeyId}/${credentialScope}`;

    const queryParams: Record<string, string> = {
        "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
        "X-Amz-Credential": credential,
        "X-Amz-Date": dateTime,
        "X-Amz-Expires": String(expiresInSeconds),
        "X-Amz-SignedHeaders": "host",
    };

    const canonicalQueryString = Object.keys(queryParams)
        .sort()
        .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(queryParams[k])}`)
        .join("&");

    const encodedKey = objectKey.split("/").map(encodeURIComponent).join("/");

    const canonicalHeaders = `host:${host}\n`;
    const canonicalRequest = [
        "GET",
        `/${encodedKey}`,
        canonicalQueryString,
        canonicalHeaders,
        "host",
        "UNSIGNED-PAYLOAD"
    ].join("\n");

    const stringToSign = [
        "AWS4-HMAC-SHA256",
        dateTime,
        credentialScope,
        sha256Hex(canonicalRequest)
    ].join("\n");

    const signingKey = getSigningKey(secretAccessKey, dateStamp, region);
    const signature = hmac(signingKey, stringToSign).toString("hex");

    return `https://${host}/${encodedKey}?${canonicalQueryString}&X-Amz-Signature=${signature}`;
}

/**
 * Extracts the S3 object key from a Cognigy files-api URL.
 * e.g. https://files-api-*.cognigy.cloud/v1.0/{orgId}/{projectId}/{objectKey}
 * → objectKey
 */
export function extractS3KeyFromCognigyUrl(url: string): string {
    const parts = url.split("/");
    return parts[parts.length - 1];
}
