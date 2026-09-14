// Helpers for reading Cognigy 'json' node fields.
// A 'json' field does not always reach the node as a parsed value: it arrives as an object or
// array when it holds literal JSON, but as a string when the field value contains CognigyScript
// (e.g. "{{context.data.myObject}}") or when a string default is passed through. Calling
// JSON.parse() on an already parsed value throws, and checks like Array.isArray() silently fail
// on a string, so every 'json' field has to be normalized before it is used.

// Normalize a 'json' field to a parsed value. Returns undefined when the field is empty.
export const parseJsonField = (api: any, value: any, fieldLabel: string): any => {
    if (value === undefined || value === null) return undefined;
    if (typeof value !== "string") return value; // already parsed by Cognigy
    const trimmed = value.trim();
    if (trimmed === "") return undefined;
    try {
        return JSON.parse(trimmed);
    } catch {
        api.log?.("error", `CXone -> parseJsonField: '${fieldLabel}' is not valid JSON: ${trimmed}`);
        throw new Error(`${fieldLabel} must be valid JSON`);
    }
};

// Same as parseJsonField, but never throws: an invalid value is logged and reported as undefined.
// Use it for optional fields where a malformed value must not fail the node (e.g. during a handover).
export const tryParseJsonField = (api: any, value: any, fieldLabel: string): any => {
    try {
        return parseJsonField(api, value, fieldLabel);
    } catch {
        api.log?.("warn", `CXone -> tryParseJsonField: ignoring invalid value of '${fieldLabel}'`);
        return undefined;
    }
};

// The CXone custom SIP header can carry ivaParams in three shapes: a JSON string (classic), an
// already parsed object (newer payloads), or wrapped as { value: "<json>" } by some widget bundles.
// All three are normalized to an object; anything unusable becomes {}.
export const normalizeIvaParams = (api: any, rawIvaParams: any): Record<string, any> => {
    const unwrapped = (rawIvaParams && typeof rawIvaParams === "object" && !Array.isArray(rawIvaParams) && "value" in rawIvaParams)
        ? rawIvaParams.value
        : rawIvaParams;

    if (typeof unwrapped === "string") {
        const parsed = tryParseJsonField(api, unwrapped, "ivaParams");
        return (parsed && typeof parsed === "object" && !Array.isArray(parsed)) ? parsed : {};
    }
    if (unwrapped && typeof unwrapped === "object" && !Array.isArray(unwrapped)) return unwrapped;
    return {};
};

// Normalize a 'json' field to a plain object. Returns {} when the field is empty.
export const parseJsonObjectField = (api: any, value: any, fieldLabel: string): Record<string, any> => {
    const parsed = parseJsonField(api, value, fieldLabel);
    if (parsed === undefined) return {};
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        throw new Error(`${fieldLabel} must be a valid JSON object`);
    }
    return parsed;
};

// Normalize a 'json' field to an array. Returns [] when the field is empty.
export const parseJsonArrayField = (api: any, value: any, fieldLabel: string): any[] => {
    const parsed = parseJsonField(api, value, fieldLabel);
    if (parsed === undefined) return [];
    if (!Array.isArray(parsed)) {
        throw new Error(`${fieldLabel} must be a valid JSON array`);
    }
    return parsed;
};
