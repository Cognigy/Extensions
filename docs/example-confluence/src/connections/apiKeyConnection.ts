import { IConnectionSchema } from "@cognigy/extension-tools";

/**
 * This file defines a 'schema' for a connection of type 'api token' and 'email'.
 * The connection needs to be referenced in the node that wants to
 * use the connection:
 * - see 'nodes/executeCognigyApiRequest.ts'
 *
 * The connection also needs to get exposed in the 'createExtension'
 * call:
 * - see 'module.ts'
 */

export const apiKeyConnection: IConnectionSchema = {
	type: "api-key",
	label: "Holds the email and api-token for connecting to Confluence.",
	fields: [
		{fieldName: "Email"},
		{fieldName: "Api-Token"}
	]
};