// Helpers to keep customer data out of the Cognigy logs.
// Transcripts contain what the customer actually said, so the payload posted to TMS is logged
// in a redacted form: the structure and sizes stay visible for troubleshooting, the wording does not.

// context.data is built from the CXone SIP headers and carries the caller's phone number in `ani`.
// The value still goes into the context for the flow to use - it just stays out of the log line.
export const redactContextData = (contextData: any): any => {
    if (!contextData || typeof contextData !== "object") return contextData;
    if (!contextData.ani) return contextData;
    return { ...contextData, ani: `<redacted: ${String(contextData.ani).length} chars>` };
};

export const redactTmsPayload = (tmsPayload: any): any => {
    if (!tmsPayload || typeof tmsPayload !== "object") return tmsPayload;
    const details = tmsPayload.selfServiceSessionDetails;
    if (!details || !Array.isArray(details.transcripts)) return tmsPayload;

    return {
        ...tmsPayload,
        selfServiceSessionDetails: {
            ...details,
            transcripts: details.transcripts.map((item: any) => ({
                ...item,
                messageBody: `<redacted: ${typeof item?.messageBody === "string" ? item.messageBody.length : 0} chars>`
            }))
        }
    };
};
