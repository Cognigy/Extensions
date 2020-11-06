export interface IRegexPattern {
    pattern: string;
    parsedPattern: string;
    tags: string[];
    slots: string[];
    matches: any[];
}

/**
 * Takes Cognigy Patterns and converts them into Regex Pattern Objects
 *
 * @param patterns A string array of Cognigy Patterns
 * @param input The Cognigy input object
 */
export const createRegexPatterns = (patterns: string[], input: any): IRegexPattern[] => {
    // firstly sort array to start with the longest patterns, as those will win
    patterns.sort((a, b) => {
        return b.length - a.length;
    });

    const regexPatterns: IRegexPattern[] = [];

    // go through patterns and create regex versions of each
    for (let pattern of patterns) {
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
                if (input.nlu.detailedSlots[slotName]) {
                    if (["DATE", "TEMPERATURE", "AGE", "PERCENTAGE", "NUMBER"].indexOf(slotName) > -1) {
                        input.nlu.detailedSlots[slotName].forEach((s) => {
                            slotValues.push(s.text);
                        });
                    } else {
                        input.nlu.detailedSlots[slotName].forEach((s) => {
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
            "slots": slots,
            "matches": []
        });
    }

    return regexPatterns;
};

export const matchPatterns = (inputText: string, regexPatterns: IRegexPattern[]): string => {
    let foundMatch = null;

    // go through all created patterns and test them
    for (let pattern of regexPatterns) {
        let result: RegExpExecArray;
        const regExp = new RegExp(pattern.parsedPattern, "gi");

        while (result = regExp.exec(inputText)) {
            foundMatch = true; // remember we found a result
            pattern.matches.push(result);
        }

        pattern.matches.forEach((m) => {
            inputText = inputText.replace(m[0], "");
        });
    }

    return foundMatch;
};