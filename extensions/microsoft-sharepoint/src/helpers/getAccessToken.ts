import axios from "axios";

export const getAccessToken = async (tenantId: string, clientId: string, clientSecret: string): Promise<string> => {
    if (!tenantId || !clientId || !clientSecret) {
        throw new Error("SharePoint cloud connection is missing tenantId, clientId, or clientSecret.");
    }

    const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

    const params = new URLSearchParams();
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    params.append('scope', 'https://graph.microsoft.com/.default');
    params.append('grant_type', 'client_credentials');

    try {
        const response = await axios.post(
            tokenUrl,
            params.toString(),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        const accessToken = response.data?.access_token;
        if (!accessToken) {
            throw new Error("Microsoft token endpoint did not return access_token.");
        }

        return accessToken;
    } catch (error: any) {
        const status = error?.response?.status;
        const errorCode = error?.response?.data?.error;
        const errorDescription = error?.response?.data?.error_description;

        const details = [
            status ? `status=${status}` : undefined,
            errorCode ? `error=${errorCode}` : undefined,
            errorDescription ? `description=${errorDescription}` : undefined
        ].filter(Boolean).join(", ");

        throw new Error(
            `Failed to fetch Microsoft Graph access token for tenant '${tenantId}'. ${details || "Check tenantId, clientId, and clientSecret."}`
        );
    }
};