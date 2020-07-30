import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import fetch, { Response } from "node-fetch";

/**
 * This file contains a more advanced example as it will also use
 * the new concept of 'connections'. The node demonstrates how you can
 * build a flow-node which uses an external packages (node-fetch).
 */

export interface IExecuteCognigyApiRequestParams extends INodeFunctionBaseParams {
	config: {
		path: string;
		connection: {
			key: string;
		};
	}
}

export const executeCognigyApiRequest = createNodeDescriptor({
	type: "executeCognigyApiRequest",
	defaultLabel: "Cognigy API Request",

	fields: [
		{
			key: "connection",
			label: "The api-key connection which should be used.",
			type: "connection",
			params: {
				connectionType: "api-key" // this needs to match the connections 'type' property
			}
		},
		{
			key: "path",
			label: "The API path to call. Full path required.",
			type: "cognigyText",
			defaultValue: "https://api.chucknorris.io/jokes/random"
		}
	],

	function: async ({ cognigy, config }: IExecuteCognigyApiRequestParams) => {
		const { api, input } = cognigy;
		const { path, connection } = config;

		let response, rawResponse: Response;

		try {
			rawResponse = await fetch(path);
			response = await rawResponse.json();

			api.say("The response of your API call is stored in the input object");

			/* write response into 'input object' */
			input.apiResponse = response;

			/* output the connection that was used in this execution */
			api.say(`The connection that was used during this call: `, connection);
		} catch (err) {
			
			// /* communicate the error in the interaction panel */
			api.say(`Your response failed. Error was: ${err}`);
		}
	}
});