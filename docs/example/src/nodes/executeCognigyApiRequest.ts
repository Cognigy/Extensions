import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';

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
	};
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
			defaultValue: "https://swapi.dev/api/people/1"
		}
	],

	function: async ({ cognigy, config }: IExecuteCognigyApiRequestParams) => {
		const { api, context } = cognigy;
		const { path, connection } = config;

		let response, rawResponse: Response;

		try {
			rawResponse = await axios.get(path);
			response = rawResponse.body;

			/* write response into 'context' object */
			context.apiResponse = response;

			// confirm
			api.output("The response of your API call is stored in the Context object");

			/* output the connection that was used in this execution */
			api.output(`We could've used the following connection, but we didn't: `, connection);
		} catch (err) {
			// /* communicate the error in the interaction panel */
			api.output(`Your response failed. Error was: ${err}`);
		}
	}
});