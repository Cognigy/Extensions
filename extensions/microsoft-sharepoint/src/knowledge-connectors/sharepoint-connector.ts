import { createKnowledgeConnector } from "@cognigy/extension-tools";
import { getSharePointFileChunks } from "./helpers/chunk_extractor";
import { getSharePointFiles } from "./helpers/list_files";
import axios from "axios";
import * as path from 'path';


export const sharepointConnector = createKnowledgeConnector({
    type: "sharepointConnector",
    label: "Sharepoint Connector",
    summary: "Creates Knowledge Sources from Sharepoint",
    fields: [
        {
            key: "connection",
            label: "Sharepoint Connection",
            type: "connection",
            params: {
                connectionType: "connector",
                required: true,
            },
        },
        {
            key: "hostname",
            label: "SharePoint Hostname",
            type: "text",
            params: { required: true },
            description: "Your SharePoint hostname (e.g., yourtenant.sharepoint.com)",
        },
        {
            key: "sitePath",
            label: "Site Path",
            type: "text",
            params: { required: true },
            description: "The site path (e.g., /sites/yoursite or /sites/team-site)",
        },
        {
            key: "sourceTags",
            label: "Source Tags",
            type: "chipInput",
            defaultValue: ["sharepoint"],
            description: "Tags to assign to the created Knowledge Source",
        }
    ] as const,

    function: async ({ config, api }) => {
        const { connection, hostname, sitePath, sourceTags } = config;

        // Extract SharePoint credentials from connection
        const { tenantId, clientId, clientSecret } = connection as {
            tenantId: string;
            clientId: string;
            clientSecret: string;
        };

        // Get access token
        const getAccessToken = async (): Promise<string> => {
            const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

            const params = new URLSearchParams();
            params.append('client_id', clientId);
            params.append('client_secret', clientSecret);
            params.append('scope', 'https://graph.microsoft.com/.default');
            params.append('grant_type', 'client_credentials');

            const response = await axios.post(tokenUrl, params);
            return response.data.access_token;
        };

        const accessToken = await getAccessToken();

        // Get site ID using hostname and site path
        const siteResponse = await axios.get(
            `https://graph.microsoft.com/v1.0/sites/${hostname}:${sitePath}`,
            {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            }
        );

        const siteId = siteResponse.data.id;

        // Get all drives (document libraries)
        const drivesResponse = await axios.get(
            `https://graph.microsoft.com/v1.0/sites/${siteId}/drives`,
            {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            }
        );

        // Process all drives/libraries in the site
        for (const drive of drivesResponse.data.value) {
            const driveId = drive.id;

            // Get all files from the drive using helper
            const files = await getSharePointFiles(accessToken, driveId);

            // Process each file
            for (const file of files) {
                try {
                    const fileExtension = path.extname(file.name).slice(1).toLowerCase();

                    // Get chunks for this file
                    const chunks = await getSharePointFileChunks(
                        accessToken,
                        driveId,
                        file.id,
                        file.name,
                        fileExtension
                    );

                    if (chunks.length === 0) {
                        continue;
                    }

                    // Create knowledge source
                    const { knowledgeSourceId } = await api.createKnowledgeSource({
                        name: file.name,
                        description: `Data from ${file.name} in SharePoint library ${drive.name}`,
                        tags: sourceTags as string[],
                        chunkCount: chunks.length,
                    });

                    // Add all chunks to the knowledge source
                    for (const chunk of chunks) {
                        await api.createKnowledgeChunk({
                            knowledgeSourceId: knowledgeSourceId,
                            text: chunk.text,
                            data: chunk.data,
                        });
                    }
                } catch (error) {
                    // Continue with next file even if this one fails
                    console.error(`Failed to process file ${file.name}:`, error);
                    continue;
                }
            }
        }
    },
});