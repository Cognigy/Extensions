import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

/**
 * This file contains a simple node whith no children and no connections.
 *
 * It demonstrates how you can write a new flow-node in Cognigy.AI 4.0.0
 * and shows important concepts like:
 *
 * - describing the 'default values' for your node
 * - describing the 'fields' of your node - our UI will generate a UI for these
 * - defining the actual code ('function')
 * - showing how the new 'api' works which can be used by nodes (see 'api')
 */

export interface IReverseSayParams extends INodeFunctionBaseParams {
	config: {
		text: string;
	};
}

export const reverseSay = createNodeDescriptor({
	type: "reverseSay",
	defaultLabel: "Reverse Say",
	fields: [
		{
			key: "text",
			label: "The text you want to reverse.",
			type: "cognigyText",
			defaultValue: "{{input.text}}"
		}
	],
	preview: {
		type: "text",
		key: "text"
	},
	function: async ({ cognigy, config }: IReverseSayParams) => {
		const { api } = cognigy;
		const { text } = config;

		const reversedText = text.split("").reverse().join("");

		api.say(reversedText);
	}
});