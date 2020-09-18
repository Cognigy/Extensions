import { Client } from "@elastic/elasticsearch";
import { ISearchParams } from "../nodes/search";

export function authenticateClient(connection: ISearchParams["config"]["connection"], authentication: ISearchParams["config"]["authentication"]): Client {

	// Extract the connection values
	const { cloudId, username, password, node, apiKey } = connection;

	let options: any;

	// Check selected Authentication
	switch (authentication) {
		case "cloud":
			options = {
				cloud: {
					id: cloudId,
				},
				auth: {
					username,
					password
				}
			};
			break;
		case "basic":
			options = {
				node,
				auth: {
					username,
					password
				}
			};
			break;
		case "apiKey":
			options = {
				node,
				auth: {
					apiKey
				}
			};
			break;
	}

	return new Client(options);
}