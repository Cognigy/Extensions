// Fill in context.data.ani for real telephony calls that arrive without it.

import { isWebRtcInteraction } from "./channel";
import { hasEnoughDigits } from "./phone";

// Only digits and the punctuation a phone number is written with - so a name
// like "Alex" or "Alex 2" can never pass as a number.
const NUMERIC_ONLY = /^[\d\s()+\-.]+$/;

export type AniSource = "numberMetaData" | "oAuthCustomerName" | "none";

/**
 * Sets `data.ani` from elsewhere on the input when a real voice contact arrives without one.
 *
 * Mutates `data` in place and returns which field the number came from, or `undefined` when
 * the case does not apply at all (not voice, not a real contact, or an ani is already there).
 */
export const fillMissingAni = (input: any, data: Record<string, any>): AniSource | undefined => {
    const isVoice = String(data.flowChannel || "").toUpperCase().indexOf("VOICE") !== -1;
    const contactId = String(data.contactId || "").trim();
    // WebRTC callers all come through the same browser entry point with no number of their
    // own, so there is nothing to recover and nothing that would tell them apart.
    const isRealContact = contactId !== "" && !isWebRtcInteraction(data);
    const alreadyHave = hasEnoughDigits(data.ani);

    if (!isVoice || !isRealContact || alreadyHave) return undefined;

    let found = "";

    // 1. numberMetaData, which the OneTechSupport flow already reads for SMS.
    //    Prefer a country code when one is there, so the value is complete.
    const meta = (input && input.data && input.data.numberMetaData) ? input.data.numberMetaData : null;
    if (meta) {
        if (meta.e164Number) {
            found = String(meta.e164Number);
        } else if (meta.nationalNumber) {
            found = String(meta.nationalNumber);
            if (meta.countryCode) {
                found = String(meta.countryCode) + found;
            }
        }
    }

    // 2. oAuthCustomerName, which carries the caller's number on some voice
    //    entry points - but a person's NAME on others ("Alex"), so it is only
    //    used when it actually looks like a number.
    if (!found) {
        const oauth = String(data.oAuthCustomerName || "");
        if (hasEnoughDigits(oauth) && NUMERIC_ONLY.test(oauth)) {
            found = oauth;
        }
    }

    if (!hasEnoughDigits(found)) return "none";

    data.ani = found;
    // Which source it came from, so a wrong number is traceable to a field
    // rather than guessed at.
    return (meta && (meta.e164Number || meta.nationalNumber)) ? "numberMetaData" : "oAuthCustomerName";
};
