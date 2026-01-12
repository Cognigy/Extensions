import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
interface S3Object {
    Key: string;
    Size: number;
    LastModified: Date;
}

interface S3Connection {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
}

export async function getS3Object(
    connection: S3Connection,
    bucketName: string,
    prefix?: string,
): Promise<S3Object[]> {
    const s3Client = new S3Client({
        region: connection.region,
        credentials: {
            accessKeyId: connection.accessKeyId,
            secretAccessKey: connection.secretAccessKey,
        },
    });

try {


    const command = new ListObjectsV2Command({
        Bucket: bucketName,
        MaxKeys: 1000,
        Prefix: prefix,
    });

    const response = await s3Client.send(command);

    if (!response.Contents) {
        return [];
    }

    const s3Objects: S3Object[] = response.Contents
    .filter(obj => obj.Key && obj.Size && obj.Size > 0)
    .map(obj => ({
        Key: obj.Key!,
        Size: obj.Size!,
        LastModified: obj.LastModified!
    })); // Filter out empty files and folders

      // Log first few files for debugging
        s3Objects.slice(0, 3).forEach((obj, index) => {
        });

    return s3Objects;

} catch (error) {
    console.error("Error listing objects from S3:", error);
    throw error;
    }
}
