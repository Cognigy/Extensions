import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { detectChannel } from "../helpers/channel-utils";


export interface ICaptureAdaptiveCardAnswerParams extends INodeFunctionBaseParams {
    config: {
        payloadPath: string;
        webchatPayloadPath: string;
        storeLocation: string;
        storeKey: string;
        voiceTextSubKey: string;
    };
}

/** Resolve a dot-notation path like "input.data.foo" against the cognigy execution objects. */
function resolvePath(path: string, cognigy: any): any {
    const parts = path.trim().split(".");
    let obj: any;
    switch (parts[0]) {
        case "input":   obj = cognigy.input;   break;
        case "context": obj = cognigy.context; break;
        case "profile": obj = cognigy.profile; break;
        default: return undefined;
    }
    for (let i = 1; i < parts.length; i++) {
        if (obj == null) return undefined;
        obj = obj[parts[i]];
    }
    return obj;
}

/**
 * Write a value at a dot-notation path into Cognigy context or input.
 * Both addToContext and addToInput use flat keys, so for nested paths we clone
 * the top-level object, set the value inside it, then write the whole object back.
 */
function writePath(api: any, store: any, path: string, value: any, storeLocation: "context" | "input"): void {
    const keys = path.trim().split(".");
    const topKey = keys[0];
    const write = storeLocation === "context"
        ? (k: string, v: any) => api.addToContext(k, v, "simple")
        // @ts-ignore
        : (k: string, v: any) => api.addToInput(k, v);

    if (keys.length === 1) {
        write(topKey, value);
        return;
    }

    // Clone top-level object, set nested value, write back
    const topValue = JSON.parse(JSON.stringify(store[topKey] ?? {}));
    let obj = topValue;
    for (let i = 1; i < keys.length - 1; i++) {
        if (obj[keys[i]] == null || typeof obj[keys[i]] !== "object") {
            obj[keys[i]] = {};
        }
        obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    write(topKey, topValue);
}

export const captureAdaptiveCardAnswer = createNodeDescriptor({
    type: "adaptiveCardAnswer",
    defaultLabel: "Capture Adaptive Card",
    summary: "Reads the card or Voice/SMS/WhatsApp answer from input and stores it. Place after Show Adaptive Card with Wait for Input enabled.",
    preview: {
        key: "storeKey",
        type: "text"
    },
    fields: [
        {
            key: "webchatPayloadPath",
            label: "Cognigy Webchat Answer Path",
            type: "cognigyText",
            description: "Dot-notation path to the answer in Cognigy Webchat. Not used for Guide Chat or Voice/SMS/WhatsApp.",
            params: {
                required: true
            },
            defaultValue: "input.data.adaptivecards"
        },
        {
            key: "payloadPath",
            label: "Guide Chat Answer Path",
            type: "cognigyText",
            description: "Dot-notation path to the answer in CXone Guide Chat. Not used for Webchat or Voice/SMS.",
            params: {
                required: true
            },
            defaultValue: "input.data.adaptiveCardAnswer"
        },
        {
            key: "storeLocation",
            label: "User Answer Store Location",
            type: "select",
            description: "Where to store the answer - Context (persists across turns) or Input (current turn only).",
            params: {
                options: [
                    { label: "Context", value: "context" },
                    { label: "Input", value: "input" }
                ],
                required: true
            },
            defaultValue: "context"
        },
        {
            key: "storeKey",
            label: "User Answer Store Key",
            type: "cognigyText",
            description: "Dot-notation path to store the answer (e.g. data.adaptiveCardAnswer).",
            params: {
                required: true
            },
            defaultValue: "data.adaptiveCardAnswer"
        },
        {
            key: "voiceTextSubKey",
            label: "Voice/SMS/WhatsApp Answer Store Sub-key",
            type: "cognigyText",
            description: "Sub-key appended to the store path for Voice/SMS/WhatsApp text answers (e.g. 'text' stores at data.adaptiveCardAnswer.text).",
            params: {
                required: true
            },
            defaultValue: "text"
        }
    ],
    sections: [],
    form: [
        { type: "field", key: "webchatPayloadPath" },
        { type: "field", key: "payloadPath" },
        { type: "field", key: "storeLocation" },
        { type: "field", key: "storeKey" },
        { type: "field", key: "voiceTextSubKey" }
    ],
    appearance: {
        color: "#445C98"
    },
    function: async ({ cognigy, config: rawConfig }: INodeFunctionBaseParams) => {
        const { payloadPath, webchatPayloadPath, storeLocation, storeKey, voiceTextSubKey } = rawConfig as ICaptureAdaptiveCardAnswerParams["config"];
        const { api, input, context } = cognigy;

        try {
            const { isVoice, isCognigy, isSms } = detectChannel(input, context);

            // Read answer from input based on channel
            const cardRaw = (isVoice || isSms)
                ? null
                : isCognigy
                    ? resolvePath(webchatPayloadPath, cognigy)  // Cognigy Webchat
                    : resolvePath(payloadPath, cognigy);        // Guide Chat (CXone)

            // If no card submission found, fall back to input.text (user typed instead of clicking)
            const isTextFallback = !isVoice && !isSms && (cardRaw == null || cardRaw === "");
            const raw = (isVoice || isSms || isTextFallback)
                ? (input as any)?.text
                : cardRaw;

            api.log?.("info", `captureAdaptiveCardAnswer: raw = ${JSON.stringify(raw)}, isCognigy=${isCognigy}, isTextFallback=${isTextFallback}`);

            if (raw == null || raw === "") {
                api.log?.("warn", `captureAdaptiveCardAnswer: no answer found.`);
                return;
            }

            let answer: any;
            let effectiveStoreKey = storeKey;
            if (isVoice || isSms || isTextFallback) {
                // Plain text answer — store at storeKey.voiceTextSubKey
                answer = raw;
                effectiveStoreKey = storeKey + "." + voiceTextSubKey;
            } else if (isCognigy) {
                // Cognigy Webchat card submission: already a plain object
                answer = raw;
            } else {
                // Guide Chat card submission: may be a JSON string; extract .acData if present
                let parsed = raw;
                if (typeof raw === "string") {
                    try { parsed = JSON.parse(raw); } catch { parsed = raw; }
                }
                answer = (parsed !== null && typeof parsed === "object" && "acData" in parsed)
                    ? parsed.acData
                    : parsed;
            }

            api.log?.("info", `captureAdaptiveCardAnswer: storing in ${storeLocation}.${effectiveStoreKey} = ${JSON.stringify(answer)}`);

            const store = storeLocation === "context" ? context : input;
            writePath(api, store, effectiveStoreKey, answer, storeLocation as "context" | "input");

            api.log?.("info", "captureAdaptiveCardAnswer: done.");
        } catch (error) {
            api.log?.("error", `captureAdaptiveCardAnswer: Error - ${(error as Error).message}`);
            throw error;
        }
    }
});
