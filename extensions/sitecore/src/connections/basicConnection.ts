import { IConnectionSchema } from "@cognigy/extension-tools";

/**
 * This file defines a 'schema' for a connection of type 'api-key'.
 * The connection needs to be referenced in the node that wants to
 * use the connection:
 * - see 'nodes/executeCognigyApiRequest.ts'
 *
 * The connection also needs to get exposed in the 'createExtension'
 * call:
 * - see 'module.ts'
 */

export const sitecoreConnection: IConnectionSchema = {
	type: "sitecore",
	label: "Connection information for Sitecore",
	fields: [
		{ fieldName: "apiEndpoint" }
	]
};

