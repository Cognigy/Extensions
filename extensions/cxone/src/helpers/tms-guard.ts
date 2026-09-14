// Guard helpers to make sure a transcript is posted to TMS only once per contact.
// The flag lives at the root of the Cognigy context under deliberately unique keys:
//   context.cxoneTmsTranscriptPostedStatus     -> "posted" | "failed" | "skipped"
//   context.cxoneTmsTranscriptPostedDetails    -> details of the last attempt
//   context.cxoneTmsTranscriptPostedContactId  -> the contact the transcript was posted for
// Only "posted" blocks a later post; "failed" and "skipped" allow a later node to retry.

export const TMS_POSTED_KEY = "cxoneTmsTranscriptPostedStatus";
export const TMS_POSTED_DETAILS_KEY = "cxoneTmsTranscriptPostedDetails";
export const TMS_POSTED_CONTACT_KEY = "cxoneTmsTranscriptPostedContactId";

export type TmsPostedStatus = "posted" | "failed" | "skipped";

// Read the current flag value from context
export const getTmsPostedStatus = (context: any): string => {
    return context?.[TMS_POSTED_KEY] || "";
};

// True only when the transcript of THIS contact was already posted successfully. A session that
// handles more than one CXone contact still posts a transcript for each of them.
export const isTmsTranscriptPosted = (context: any, contactId?: string): boolean => {
    if (getTmsPostedStatus(context) !== "posted") return false;
    const postedFor = context?.[TMS_POSTED_CONTACT_KEY];
    return !postedFor || !contactId || postedFor === contactId;
};

// Read the transcript from input (or context) and make sure it is usable by the TMS payload builder,
// which expects an array of conversation items. Returns the array, or null with the reason why not.
export const resolveTranscript = (api: any, input: any, context: any, nodeName: string): { transcript: any[] | null; reason: string } => {
    const rawTranscript = input?.transcript || context?.transcript || '';
    const source = input?.transcript ? 'input' : context?.transcript ? 'context' : 'none';
    api.log?.("info", `${nodeName}: transcript available: ${!!rawTranscript}; source: ${source}`);

    if (!rawTranscript) {
        api.log?.("warn", `${nodeName}: No transcript found in input or context; nothing posted to TMS. Place Cognigy's 'Get Transcript' node above this node in the flow.`);
        return { transcript: null, reason: "No transcript available in input or context" };
    }
    if (!Array.isArray(rawTranscript)) {
        api.log?.("error", `${nodeName}: the transcript found in '${source}' is not an array of conversation items (got ${typeof rawTranscript}); nothing posted to TMS. Cognigy's 'Get Transcript' node must store the transcript under the key 'transcript'.`);
        return { transcript: null, reason: `Transcript in '${source}' is not an array of conversation items` };
    }
    if (rawTranscript.length === 0) {
        api.log?.("warn", `${nodeName}: the transcript is an empty array; nothing posted to TMS.`);
        return { transcript: null, reason: "Transcript is empty" };
    }

    // Keep only the items the TMS payload builder can handle. A single malformed item (no payload,
    // or a timestamp that is not a valid date) would otherwise fail the whole post with an opaque
    // error such as "Invalid time value", losing the entire transcript.
    const usableTranscript = rawTranscript.filter(item => {
        if (!item || typeof item !== "object") return false;
        if (!item.payload || typeof item.payload !== "object") return false;
        return !isNaN(new Date(item.timestamp).getTime());
    });
    const droppedItems = rawTranscript.length - usableTranscript.length;
    if (droppedItems > 0) {
        api.log?.("warn", `${nodeName}: ignored ${droppedItems} of ${rawTranscript.length} transcript item(s) without a payload or with an invalid timestamp.`);
    }
    if (usableTranscript.length === 0) {
        api.log?.("error", `${nodeName}: no usable transcript items - every item is missing a payload or carries an invalid timestamp; nothing posted to TMS.`);
        return { transcript: null, reason: "Transcript holds no usable conversation items" };
    }

    api.log?.("info", `${nodeName}: transcript length: ${JSON.stringify(usableTranscript).length} chars; items: ${usableTranscript.length}`);
    return { transcript: usableTranscript, reason: "" };
};

// Write the flag to the root of the context
export const setTmsPostedStatus = (api: any, context: any, status: TmsPostedStatus, details: string, contactId?: string): void => {
    api.addToContext?.(TMS_POSTED_KEY, status, "simple");
    api.addToContext?.(TMS_POSTED_DETAILS_KEY, details, "simple");
    if (contactId) api.addToContext?.(TMS_POSTED_CONTACT_KEY, contactId, "simple");
    // keep the in-memory context in sync, so nodes running later in the same flow execution see the flag
    if (context && typeof context === "object") {
        context[TMS_POSTED_KEY] = status;
        context[TMS_POSTED_DETAILS_KEY] = details;
        if (contactId) context[TMS_POSTED_CONTACT_KEY] = contactId;
    }
    api.log?.("info", `CXone -> setTmsPostedStatus: context.${TMS_POSTED_KEY} = '${status}'; details: ${details}`);
};
