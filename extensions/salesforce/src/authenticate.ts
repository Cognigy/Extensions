import jsforce, { Connection } from "jsforce";

interface IConnection {
    basicConnection: {
        username: string;
        password: string;
        loginUrl: string;
    };
    oauthConnection: {
        consumerKey: string;
        consumerSecret: string;
        loginUrl: string;
    };
}

export const authenticate = async (connectionType: (string | "basic" | "oauth"), basicConnection: IConnection["basicConnection"], oauthConnection: IConnection["oauthConnection"], apiVersion: string = "62.0") => {

    const { username, password } = basicConnection;
    const { consumerKey, consumerSecret } = oauthConnection;

    const salesforceAPIVersion: string = apiVersion !== "62.0" ? apiVersion : "62.0";
    let salesforceConnection: Connection;

    if (connectionType === "oauth") {

        const oauth2 = new jsforce.OAuth2({
            clientId: consumerKey,
            clientSecret: consumerSecret,
            loginUrl: oauthConnection.loginUrl
        });

        salesforceConnection = new jsforce.Connection({ oauth2, version: salesforceAPIVersion});

        // Authenticate using the Client Credentials Flow
        await salesforceConnection.authorize({ grant_type: "client_credentials" });

    } else {

        salesforceConnection = new jsforce.Connection(
            {
                loginUrl: basicConnection.loginUrl,
                version: salesforceAPIVersion
            });

        await salesforceConnection.login(username, password);
    }

    return salesforceConnection;
}