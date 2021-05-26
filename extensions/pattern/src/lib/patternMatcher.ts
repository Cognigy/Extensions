import { INLProperties } from "@cognigy/extension-tools/build/interfaces/descriptor";

/**
 * Finds compound slots using pattern inside the user input
 * @param ci Cognigy Input Object
 * @param patterns The patterns to check for
 * @param compoundGroupName Name for the compound group
 * @param detailedCompoundSlots Store detailed results for compound slots
 * @param tagExistingSlots Tag existing slots
 * @param createNewSlots Create new slots from tags
 * @param alternateInput Input text to use instead of input text
 */
export const patternMatcher = (ci: INLProperties, patterns: string[], compoundGroupName: string, detailedCompoundSlots: boolean, tagExistingSlots: boolean, createNewSlots: boolean, alternateInput: string): INLProperties => {
    // firstly sort array to start with the longest patterns, as those will win
    patterns.sort((a, b) => {
        return b.length - a.length;
    });

    // we use let because we strip out found phrases later
    let inputText = alternateInput || ci.text; // ci.processText

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
                if (ci.slots[slotName]) {
                    switch (slotName) {
                        case "DATE":
                            ci.slots.DATE.forEach((s) => {
                                // just add the number
                                if (s.start) slotValues.push(s.start["text"]);
                                if (s.end) slotValues.push(s.end["text"]);
                            });
                            break;

                        case "TEMPERATURE":
                            ci.slots.TEMPERATURE.forEach((s) => {
                                // just add the number
                                slotValues.push(s);
                            });
                            break;
                        case "AGE":
                            ci.slots.AGE.forEach((s) => {
                                // just add the number
                                slotValues.push(s);
                            });
                            break;
                        case "PERCENTAGE":
                            ci.slots.PERCENTAGE.forEach((s) => {
                                // just add the number
                                slotValues.push(s + "%");
                                slotValues.push(s + " percent");
                            });
                        case "NUMBER":
                            ci.slots.NUMBER.forEach((s) => {
                                // just add the number
                                slotValues.push(s);
                            });
                            break;

                        default:
                            ci.slots[slotName].forEach((s) => {
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
                            originalSlot = ci.slots.DATE.find(e => (e.start && e.start["text"]) || (e.end && e.end["text"] === matches[i]));
                            break;

                        default:
                            originalSlot = ci.slots[pattern.slots[i - 1]].find(e => (e.synonym) ? e.synonym === matches[i].toLowerCase() : false);
                    }

                    // create compound groups
                    if (detailedCompoundSlots) {
                        const components = {
                            "slot": pattern.slots[i - 1],
                            "value": originalSlot.keyphrase || originalSlot
                        };
                        if (pattern.tags[i - 1]) components["tag"] = pattern.tags[i - 1];
                        else components["tag"] = null;

                        compoundGroup.components.push(components);
                    } else {
                        if (pattern.tags[i - 1]) compoundGroup[pattern.tags[i - 1]] = originalSlot.keyphrase || originalSlot;
                        else compoundGroup[pattern.slots[i - 1]] = originalSlot || originalSlot.keyphrase;
                    }

                    if (pattern.tags[i - 1]) {
                        if (createNewSlots) {
                            if (ci.slots[pattern.tags[i - 1]]) {
                                ci.slots[pattern.tags[i - 1]].push(originalSlot);
                            } else ci.slots[pattern.tags[i - 1]] = [originalSlot];
                        }

                        if (tagExistingSlots) {
                            ci.slots[pattern.slots[i - 1]].forEach((s) => {
                                if (s.synonym && s.synonym === matches[i])
                                    s["tags"] = (Array.isArray(s["tags"])) ? s["tags"].push(pattern.tags[i - 1]) : [pattern.tags[i - 1]];
                            });
                        }
                    }
                }
                compoundGroups.push(compoundGroup);
            });
        }
    });

    if (!ci["compoundSlots"]) ci["compoundSlots"] = {};
    ci["compoundSlots"][compoundGroupName] = compoundGroups;

    if (compoundGroups && compoundGroups.length === 0 && (!Array.isArray(ci["compoundSlots"]) || ci["compoundSlots"].length === 0)) delete ci["compoundSlots"];
    return ci;
};