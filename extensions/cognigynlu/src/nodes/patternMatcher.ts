
import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

export interface IPatternMatcherParams extends INodeFunctionBaseParams {
	config: {
		patterns: string[];
		compoundGroupName: string;
		detailedCompoundSlots: boolean;
		tagExistingSlots: boolean;
		createNewSlots: boolean;
		alternateInput: string;
	};
}

export const patternMatcherNode = createNodeDescriptor({
	type: "patternMatcher",
	defaultLabel: "Pattern Matcher",
	summary: "Finds compound slots using pattern inside the user input",
	preview: {
		key: "compoundGroupName",
		type: "text"
	},
	tags: ["pattern", "compound"],
	fields: [
		{
			key: "patterns",
			label: "Patterns",
			type: "textArray",
		},
		{
			key: "compoundGroupName",
			label: "Compound Group",
			description: "The name of the compound slot group to create",
			type: "cognigyText",
			defaultValue: "",
			params: {
				required: true
			}
		},
		{
			key: "detailedCompoundSlots",
			label: "Store Detailed Slots",
			type: "toggle",
			defaultValue: false,
		},
		{
			key: "tagExistingSlots",
			type: "toggle",
			label: "Tag Existing Slots",
			description: "Add tags to existing slots",
			defaultValue: false,
		},
		{
			key: "createNewSlots",
			type: "toggle",
			label: "Create New Slots",
			defaultValue: false,
		},
		{
			key: "alternateInput",
			type: "toggle",
			label: "Alternate Input",
			description: "Use a different input from input.text",
		},
	],
	sections: [
		{
			key: "advanced",
			label: "Advanced",
			defaultCollapsed: true,
			fields: [
				"detailedCompoundSlots",
				"tagExistingSlots",
				"createNewSlots",
				"alternateInput"
			]
		},
	],
	form: [
		{ type: "field", key: "compoundGroupName" },
		{ type: "field", key: "patterns" },
		{ type: "section", key: "advanced" },
	],
	// function: getConversationFunction
	function: async ({ cognigy, config }: IPatternMatcherParams): Promise<any> => {
		const { input } = cognigy;
		const { patterns, compoundGroupName, detailedCompoundSlots, tagExistingSlots, createNewSlots, alternateInput } = config;

		// firstly sort array to start with the longest patterns, as those will win
		patterns.sort((a, b) => {
			return b.length - a.length;
		});

		// we use let because we strip out found phrases later
		let inputText = alternateInput || input.processText || input.text;

		const regexPatterns = [];

		// go through patterns and create regex versions of each
		patterns.forEach((pattern) => {
			// set parsedPattern to pattern in case there are no slots
			let parsedPattern = pattern;

			// match all mentioned slots in the pattern
			const foundSlots = pattern.match(/\@[\w>]+/g);
			const tags = [];
			const slots = [];

			// if there are slots, process them
			if (Array.isArray(foundSlots) && foundSlots.length > 0) {
				foundSlots.forEach((slot) => {
					// splits tags from slots
					const split = slot.split(">");
					const slotName = split[0].replace("@", "");
					slots.push(slotName);

					// if there is a tag (SLOT>TAG), remember it
					if (split.length === 2) tags.push(split[1]);
					else tags.push("");

					const slotValues = [];
					if (input.slots[slotName]) {
						switch (slotName) {
							case "DATE":
								input.slots.DATE.forEach((s) => {
									// just add the text
									slotValues.push(s["text"]);
								});
								break;

							case "TEMPERATURE":
								input.slots.TEMPERATURE.forEach((s) => {
									// just add the number
									slotValues.push(s);
								});
								break;
							case "AGE":
								input.slots.AGE.forEach((s) => {
									// just add the number
									slotValues.push(s);
								});
								break;
							case "PERCENTAGE":
								input.slots.PERCENTAGE.forEach((s) => {
									// just add the number
									slotValues.push(s + "%");
									slotValues.push(s + " percent");
								});
								break;

							case "NUMBER":
								input.slots.NUMBER.forEach((s) => {
									// just add the number
									slotValues.push(s);
								});
								break;

							default:
								input.slots[slotName].forEach((s) => {
									// it's important to use the synonym, as this is the text that was actually found
									slotValues.push(s.synonym);
								});
						}

						const slotRegex = slotValues.join("|");
						// replace the slots name with the list of actually found entites for this slot
						parsedPattern = parsedPattern.replace(new RegExp(`${slot}`, "g"), `(${slotRegex})`);
					}
				});
			}

			regexPatterns.push({
				"pattern": pattern,
				"parsedPattern": parsedPattern,
				"tags": tags,
				"slots": slots
			});
		});

		const compoundGroups = [];

		// go through all created patterns and test them
		regexPatterns.forEach((pattern) => {
			let result;
			const regExp = new RegExp(pattern.parsedPattern, "gi");
			const regexMatches = [];

			while (result = regExp.exec(inputText)) {
				regexMatches.push(result);
			}

			regexMatches.forEach((m) => {
				inputText = inputText.replace(m[0], "");
			});

			if (regexMatches.length > 0) {
				// we found a match for this pattern!
				regexMatches.forEach((matches, mi) => {
					// set up a compoundGroup scaffold, just in case we need it
					const compoundGroup = {
						"matchedPhrase": matches[0],
						"components": []
					};

					if (!detailedCompoundSlots) delete compoundGroup.components;

					// iterate through matches, starting at the first group result ([0] is the full match)
					for (let i = 1; i < matches.length; i++) {
						let originalSlot = null;
						console.log(JSON.stringify(pattern, undefined, 4));
						if (pattern.slots[i - 1])
							switch (pattern.slots[i - 1]) {
								case "PERCENTAGE":
									originalSlot = Number(matches[i].replace(new RegExp("[^0-9]", "gi"), ""));
									break;

								case "TEMPERATURE":
								case "AGE":
								case "NUMBER":
									originalSlot = Number(matches[i]);
									break;

								case "DATE":
									originalSlot = input.slots.DATE.find(e => e.end && e["text"] === matches[i]);
									break;

								default:
									originalSlot = input.slots[pattern.slots[i - 1]].find(e => (e.synonym) ? e.synonym === matches[i].toLowerCase() : false);
							}

						// create compound groups
						if (detailedCompoundSlots && pattern.slots[i - 1] && originalSlot) {
							const components = {
								"slot": pattern.slots[i - 1],
								"value": originalSlot?.keyphrase || originalSlot
							};

							if (pattern.tags[i - 1]) {
								components["tag"] = pattern.tags[i - 1];
							} else {
								components["tag"] = null;
							}

							compoundGroup.components.push(components);
						} else {
							if (pattern.tags[i - 1]) {
								compoundGroup[pattern.tags[i - 1]] = originalSlot.keyphrase || originalSlot;
							} else if (pattern.slots[i - 1]) {
								compoundGroup[pattern.slots[i - 1]] = originalSlot || originalSlot.keyphrase;
							}
						}

						if (pattern.tags[i - 1]) {
							if (createNewSlots) {
								if (input.slots[pattern.tags[i - 1]]) {
									input.slots[pattern.tags[i - 1]].push(originalSlot);
								} else {
									input.slots[pattern.tags[i - 1]] = [originalSlot];
								}
							}

							if (tagExistingSlots) {
								input.slots[pattern.slots[i - 1]].forEach((s) => {
									if (s.synonym && s.synonym === matches[i]) {
										s["tags"] = (Array.isArray(s["tags"])) ? s["tags"].push(pattern.tags[i - 1]) : [pattern.tags[i - 1]];
									}
								});
							}
						}
					}
					compoundGroups.push(compoundGroup);
				});
			}
		});

		if (!input["compoundSlots"]) {
			input["compoundSlots"] = {};
		}
		input["compoundSlots"][compoundGroupName] = compoundGroups;

		if (compoundGroups && compoundGroups.length === 0 && (!Array.isArray(input["compoundSlots"]) || input["compoundSlots"].length === 0)) {
			delete input["compoundSlots"];
		}
	}
});