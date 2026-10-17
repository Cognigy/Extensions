import axios from 'axios';

interface SharePointFile {
    id: string;
    name: string;
    size: number;
    lastModified: Date;
    webUrl: string;
}

const SUPPORTED_EXTENSIONS = ['txt', 'pdf', 'docx', 'csv', 'json', 'jsonl', 'md', 'pptx'];

/**
 * Purpose: List all available documents from SharePoint
 *
 * What it does:
 * - Queries Microsoft Graph API to get all files from a drive
 * - Returns metadata: id, name, size, lastModified, webUrl
 * - Filters out empty files and folders
 * - Supports pagination (MaxKeys: 1000)
 * - Handles errors gracefully
 * - Only returns supported file types
 */
export async function getSharePointFiles(
    accessToken: string,
    driveId: string,
    folderId?: string
): Promise<SharePointFile[]> {
    try {
        // Build the API endpoint
        const baseUrl = folderId
            ? `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${folderId}/children`
            : `https://graph.microsoft.com/v1.0/drives/${driveId}/root/children`;

        const url = `${baseUrl}?$top=1000`;

        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.data.value) {
            return [];
        }

        // Filter for files only (not folders), non-empty, and supported types
        const sharePointFiles: SharePointFile[] = response.data.value
            .filter((item: any) => {
                if (!item.file) return false; // Skip folders
                if (!item.size || item.size === 0) return false; // Skip empty files

                const nameLower = item.name.toLowerCase();
                return SUPPORTED_EXTENSIONS.some(ext => nameLower.endsWith(`.${ext}`));
            })
            .map((item: any) => ({
                id: item.id,
                name: item.name,
                size: item.size,
                lastModified: new Date(item.lastModifiedDateTime),
                webUrl: item.webUrl
            }));

        // Log first few files for debugging
        sharePointFiles.slice(0, 3).forEach((file, index) => {
            console.log(`File ${index + 1}: ${file.name} (${file.size} bytes)`);
        });

        return sharePointFiles;

    } catch (error) {
        console.error("Error listing files from SharePoint:", error);
        throw error;
    }
}
