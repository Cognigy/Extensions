import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { patternMatcher } from "../lib/patternMatcher";

export interface IMatchPatternParams extends INodeFunctionBaseParams {
	config: {
		patterns: string[];
		compoundGroupName: string;
		alternateInput: string;
		detailedCompoundSlots: boolean;
		createNewSlots: boolean;
		tagExistingSlots: boolean;
	};
}

export const matchPatternNode = createNodeDescriptor({
	type: "matchPattern",
	defaultLabel: "Match Pattern",
	fields: [
		{
			key: "patterns",
			label: "Patterns",
			type: "textArray",
		},
		{
			key: "compoundGroupName",
			label: "Compund Group Name",
			description: "Name for the compound group",
			type: "cognigyText",
		},
		{
			key: "alternateInput",
			label: "Alternate Input",
			description: "The input text to use instead of the current input text",
			type: "cognigyText",
		},
		{
			key: "detailedCompoundSlots",
			label: "Detailed Compound Slots",
			description: "Whether to store detailed results for the compound slots or not",
			type: "toggle",
		},
		{
			key: "createNewSlots",
			label: "Create New Slots",
			description: "Whether to create new slots from tags or not",
			type: "toggle",
		},
		{
			key: "tagExistingSlots",
			label: "Tag Existing Slots",
			description: "Whether to tag existing slots or not",
			type: "toggle",
		}
	],
	form: [
		{ type: "field", key: "patterns" },
		{ type: "field", key: "compoundGroupName" },
		{ type: "field", key: "alternateInput" },
		{ type: "field", key: "detailedCompoundSlots" },
		{ type: "field", key: "createNewSlots" },
		{ type: "field", key: "tagExistingSlots" },
	],
	function: async ({ cognigy, config }: IMatchPatternParams) => {
		let { input } = cognigy;
		const { patterns, compoundGroupName, alternateInput, detailedCompoundSlots, createNewSlots, tagExistingSlots } = config;

		const result = patternMatcher(input, patterns, compoundGroupName, detailedCompoundSlots, tagExistingSlots, createNewSlots, alternateInput);

		input = result;
	}
});
