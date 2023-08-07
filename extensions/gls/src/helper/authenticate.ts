import axios from 'axios';

interface IAPIAuthorization {
    access_token: string;
    token_type: 'bearer' | string;
    expires_in: number;
    scope: string;
}

export const authenticate = async (serverUrl: string, clientId: string, clientSecret: string): Promise<IAPIAuthorization> => {

    try {

        const payload = `grant_type=client_credentials`
            + `&client_id=${clientId}`
            + `&client_secret=${clientSecret}`;

        const authResponse = await axios({
            method: 'POST',
            url: `${serverUrl}/oauth2/v2/token`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            data: payload
        });

        return authResponse?.data;
    } catch (error) {
        return null;
    }
};