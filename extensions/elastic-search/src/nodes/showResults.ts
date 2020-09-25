import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import showGalleryMessage from "../helpers/showGalleryMessage";

export interface IShowOrderListParams extends INodeFunctionBaseParams {
	config: {
		resultStoreLocation: any;
		fallbackText: string;
	};
}
export const showResultsNode = createNodeDescriptor({
	type: "showResults",
	defaultLabel: "Show Results",
	fields: [
		{
			key: "resultStoreLocation",
			type: "cognigyText",
			defaultValue: "context.elastic.result",
			label: "Search Result Location",
			description: "The location of the search result in the input or context object."
		},
		{
			key: "fallbackText",
			type: "cognigyText",
			label: "Fallback Text",
			description: "The text that should be sent when the used channel is not able to display a gallery."
		}
	],
	form: [
		{ type: "field", key: "resultStoreLocation" },
		{ type: "field", key: "fallbackText" }
	],
	appearance: {
		color: "#f3d337"
	},
	function: async ({ cognigy, config }: IShowOrderListParams) => {
		const { api } = cognigy;
		const { resultStoreLocation, fallbackText } = config;

		let results: any[] = cognigy.input.elastic.result.hits.hits || cognigy.context.elastic.result.hits.hits;

		// Display the adidas order list as gallery
		showGalleryMessage(api, results, fallbackText);
	}
});