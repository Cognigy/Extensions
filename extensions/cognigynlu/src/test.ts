import { Cipher } from "crypto";
import { createRegexPatterns, matchPatterns } from "./helpers/utils";

const matchPatternIntent = (cognigy, config) => {
    const { input } = cognigy;
    const { patterns, alternateInput, intentName } = config;
    let inputText = alternateInput || input.processText || input.text;

    const regexPatterns = createRegexPatterns(patterns, input);
    const found = matchPatterns(inputText, regexPatterns);

    if (found) {
        input.intent = intentName;
    }
}

const createCompoundSlots = (cognigy, config) => {
    const { input } = cognigy;
    const { patterns, compoundGroupName, detailedCompoundSlots, tagExistingSlots, createNewSlots, alternateInput } = config;

    // we use let because we strip out found phrases later
    let inputText = alternateInput || input.processText || input.text;

    const regexPatterns = createRegexPatterns(patterns, input);
    matchPatterns(inputText, regexPatterns);

    const compoundGroups = [];
    for (let pattern of regexPatterns) {
        let regexMatches = pattern.matches;

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
                                originalSlot = input.slots.DATE.find(e => (e.start && e.start["text"]) || (e.end && e.end["text"] === matches[i]));
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
    }

    if (!input["compoundSlots"]) {
        input["compoundSlots"] = {};
    }
    input["compoundSlots"][compoundGroupName] = compoundGroups;

    if (compoundGroups && compoundGroups.length === 0 && (!Array.isArray(input["compoundSlots"]) || input["compoundSlots"].length === 0)) {
        delete input["compoundSlots"];
    }
};

const cognigy = {
    input: {
        "text": "tomorrow 100 10 degrees 3 years old 5% 22 miles 100 euros 10 minutes 4 seconds https://www.cognigy.com",
        "intent": null,
        "intentScore": null,
        "intentFlow": null,
        "slots": {
            "DATE": [
            {
                "start": {
                "year": 2020,
                "month": 11,
                "day": 5,
                "hour": 0,
                "minute": 0,
                "second": 0,
                "weekday": 4,
                "dayOfWeek": "Thursday",
                "ISODate": "2020-11-05T00:00:00.000Z",
                "grain": "day"
                },
                "end": null,
                "text": "tomorrow"
            }
            ],
            "NUMBER": [
            100
            ],
            "TEMPERATURE": [
            {
                "value": 10,
                "unit": "degree"
            }
            ],
            "AGE": [
            {
                "value": 3,
                "unit": "year"
            }
            ],
            "PERCENTAGE": [
            5
            ],
            "DISTANCE": [
            {
                "value": 22,
                "unit": "mile"
            }
            ],
            "MONEY": [
            {
                "value": 100,
                "unit": "EUR"
            }
            ],
            "DURATION": [
            {
                "inSeconds": 4,
                "minutes": 10,
                "unit": "second",
                "seconds": 4
            }
            ],
            "URL": [
            "https://www.cognigy.com"
            ]
        },
        "nlu": {
            "intentMapperResults": {
            "finalIntentName": null,
            "finalIntentScore": null,
            "finalIntentNegated": false,
            "finalIntentConfirmationSentence": null,
            "finalIntentDisambiguationSentence": null,
            "highestFlow": null,
            "intentPath": [],
            "intentPathIds": [],
            "intentPathFlowReferenceIds": [],
            "scores": []
            },
            "intentFlow": null,
            "intentId": null,
            "detailedSlots": {
                "DATE": [
                    {
                    "data": {
                        "start": {
                        "year": 2020,
                        "month": 11,
                        "day": 5,
                        "hour": 0,
                        "minute": 0,
                        "second": 0,
                        "weekday": 4,
                        "dayOfWeek": "Thursday",
                        "ISODate": "2020-11-05T00:00:00.000Z",
                        "grain": "day"
                        },
                        "end": null
                    },
                    "text": "tomorrow",
                    "offset": {
                        "start": 0,
                        "end": 8
                    }
                    },
                    {
                        "data": {
                            "start": {
                            "year": 2020,
                            "month": 11,
                            "day": 5,
                            "hour": 0,
                            "minute": 0,
                            "second": 0,
                            "weekday": 4,
                            "dayOfWeek": "Thursday",
                            "ISODate": "2020-11-05T00:00:00.000Z",
                            "grain": "day"
                            },
                            "end": null
                        },
                        "text": "today at 5pm",
                        "offset": {
                            "start": 0,
                            "end": 8
                        }
                        }
                ],
                "NUMBER": [
                    {
                    "data": {
                        "value": 100
                    },
                    "text": "100",
                    "offset": {
                        "start": 9,
                        "end": 12
                    }
                    }
                ],
                "TEMPERATURE": [
                    {
                    "data": {
                        "value": 10,
                        "unit": "degree"
                    },
                    "text": "10 degrees",
                    "offset": {
                        "start": 13,
                        "end": 23
                    }
                    }
                ],
                "AGE": [
                    {
                    "data": {
                        "value": 3,
                        "unit": "year"
                    },
                    "text": "3 years old",
                    "offset": {
                        "start": 24,
                        "end": 35
                    }
                    }
                ],
                "PERCENTAGE": [
                    {
                    "data": {
                        "value": 5
                    },
                    "text": "5%",
                    "offset": {
                        "start": 36,
                        "end": 38
                    }
                    }
                ],
                "DISTANCE": [
                    {
                    "data": {
                        "value": 22,
                        "unit": "mile"
                    },
                    "text": "22 miles",
                    "offset": {
                        "start": 39,
                        "end": 47
                    }
                    }
                ],
                "MONEY": [
                    {
                    "data": {
                        "value": 100,
                        "unit": "EUR"
                    },
                    "text": "100 euros",
                    "offset": {
                        "start": 48,
                        "end": 57
                    }
                    }
                ],
                "DURATION": [
                    {
                    "data": {
                        "inSeconds": 4,
                        "minutes": 10,
                        "unit": "second",
                        "seconds": 4
                    },
                    "text": "10 minutes 4 seconds",
                    "offset": {
                        "start": 58,
                        "end": 78
                    }
                    }
                ],
                "URL": [
                    {
                    "data": {
                        "value": "https://www.cognigy.com",
                        "domain": ""
                    },
                    "text": "https://www.cognigy.com",
                    "offset": {
                        "start": 79,
                        "end": 102
                    }
                    }
                ]
            },
            "tokens": [
            "tomorrow",
            "100",
            "10",
            "degrees",
            "3",
            "years",
            "old",
            "5",
            "%",
            "22",
            "miles",
            "100",
            "euros",
            "10",
            "minutes",
            "4",
            "seconds",
            "https://www.cognigy.com"
            ]
        },
        "mode": "TextOnly",
        "type": "Statement",
        "question": {
            "exists": false
        },
        "intentOutOfState": null,
        "currentTime": {
            "year": 2020,
            "month": 11,
            "day": 4,
            "hour": 22,
            "minute": 9,
            "second": 43,
            "milliseconds": 998,
            "weekday": 3,
            "ISODate": "2020-11-04T22:09:43",
            "timezoneOffset": "Europe/Berlin"
        },
        "hashedIp": "76cc8cbda7cc480e89ae15773a394d55338bd5ea",
        "state": "default",
        "channel": "adminconsole",
        "endpointType": "adminconsole",
        "entrypoint": "5fa265a5927691544f7bfd80",
        "userId": "p.heltewig@cognigy.com",
        "inputId": "c7320998-f6fa-454f-a912-68b92440e938",
        "sessionId": "8213c78e-661e-4f7b-bae0-2f3c5cee8be7",
        "flowName": "regex rules",
        "URLToken": null,
        "frustration": 0,
        "completedGoals": [],
        "execution": 7,
        "data": {},
        "understood": true,
        "language": "en-US",
        "traceId": "endpoint-realtimeClient-b3c5d6a5-ebf9-4de9-bc93-00e97bf72ecd",
        "localeId": "545393bc-6dcc-412a-a4d4-561b4c1fd83e",
        "conditionalEntrypointWasExecuted": false
    }
};

const config =  { 
    patterns: [
        `^(hello|hallo) (world|welt) [n]{3} at @DATE$`
    ],
    intentName: "test",
    compoundGroupName: "test", 
    detailedCompoundSlots: false, 
    tagExistingSlots: false, 
    createNewSlots: false, 
    alternateInput: false
};

cognigy.input.text = "hello welt nnn at tomorrow";

matchPatternIntent(cognigy, config);

console.log(cognigy.input.intent);

// createCompoundSlots(cognigy, config);
// console.log(JSON.stringify(cognigy.input["compoundGroups"]));