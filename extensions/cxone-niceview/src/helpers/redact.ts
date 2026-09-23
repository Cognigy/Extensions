// Helpers to keep customer data out of the Cognigy logs.
//
// context.data is built from the NiCEview SIP headers and carries the caller's phone number in
// `ani`. The value still goes into the context for the flow to use - it just stays out of the log.
//
// The same number can reach the log through the fields the ani back-fill reads (see
// helpers/ani.ts): `numberMetaData`, and `oAuthCustomerName` when it holds a number rather
// than a name.

import { hasEnoughDigits } from "./phone";

/** One redaction format for the whole extension: the size stays visible, the value does not. */
export const mask = (value: any): string => `<redacted: ${String(value).length} chars>`;

export const redactContextData = (contextData: any): any => {
    if (!contextData || typeof contextData !== "object") return contextData;

    let redacted = contextData;
    const copyOnce = (): any => {
        if (redacted === contextData) redacted = { ...contextData };
        return redacted;
    };

    if (contextData.ani) {
        copyOnce().ani = mask(contextData.ani);
    }
    if (contextData.numberMetaData && typeof contextData.numberMetaData === "object") {
        copyOnce().numberMetaData = "<redacted>";
    }
    // A name here is useful in the log; a phone number is not ours to print.
    if (hasEnoughDigits(contextData.oAuthCustomerName)) {
        copyOnce().oAuthCustomerName = mask(contextData.oAuthCustomerName);
    }

    // The demo's user token is a credential: it fetches that demo's settings from NiCEview.
    if (contextData.userToken) {
        copyOnce().userToken = mask(contextData.userToken);
    }
    // ...and it arrives nested on some demos, which is where the session report reads it from.
    const iva = contextData.ivaParams;
    if (iva && typeof iva === "object" && iva.contextData && typeof iva.contextData === "object" && iva.contextData.userToken) {
        copyOnce().ivaParams = {
            ...iva,
            contextData: { ...iva.contextData, userToken: mask(iva.contextData.userToken) }
        };
    }

    return redacted;
};
