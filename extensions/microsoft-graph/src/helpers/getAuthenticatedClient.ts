import { Client } from "@microsoft/microsoft-graph-client";

export default function getAuthenticatedClient(accessToken: string): Client {
	// Initialize Graph client
	const client = Client.init({
		// Use the provided access token to authenticate requests
		authProvider: (done: any) => {
			done(null, accessToken);
		}
	});

	return client;
}