// Helpers to keep customer data out of the Cognigy logs.
//
// context.data is built from the NiCEview SIP headers and carries the caller's phone number in
// `ani`. The value still goes into the context for the flow to use - it just stays out of the log.

export const redactContextData = (contextData: any): any => {
    if (!contextData || typeof contextData !== "object") return contextData;
    if (!contextData.ani) return contextData;
    return { ...contextData, ani: `<redacted: ${String(contextData.ani).length} chars>` };
};
