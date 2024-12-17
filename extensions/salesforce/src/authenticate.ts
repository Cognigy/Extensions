import jsforce, { Connection } from "jsforce";

interface IConnection {
    oauthConnection: {
        consumerKey: string;
        consumerSecret: string;
        instanceUrl: string;
    };
}

export const authenticate = async (oauthConnection: IConnection["oauthConnection"], apiVersion: string = "62.0") => {

    const { consumerKey, consumerSecret, instanceUrl } = oauthConnection;

    const salesforceAPIVersion: string = apiVersion !== "62.0" ? apiVersion : "62.0";
    let salesforceConnection: Connection;

    const oauth2 = new jsforce.OAuth2({
        clientId: consumerKey,
        clientSecret: consumerSecret,
        loginUrl: instanceUrl
    });

    salesforceConnection = new jsforce.Connection({ oauth2, version: salesforceAPIVersion });

    // Authenticate using the Client Credentials Flow
    await salesforceConnection.authorize({ grant_type: "client_credentials" });

    return salesforceConnection;
}