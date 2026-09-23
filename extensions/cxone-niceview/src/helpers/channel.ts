// How an interaction reached us, decided in one place.
//
// Several nodes need the same distinctions - a real telephone call is not a WebRTC demo
// launched from our own page, and neither is a Guide chat - and the rules are not obvious
// from context.data alone. Keeping them here stops two nodes drifting into two different
// definitions of the same channel.

// The placeholder contact id: no real CXone contact exists behind the interaction
// (see setNiCEviewContextFallback, and setCxoneContextInit in the cxone extension)
export const PLACEHOLDER_CONTACT_ID = "100000000000";

export interface IChannelKind {
    /** A call over the telephone network, with a CXone contact of its own */
    isTelephony: boolean;
    /** A demo launched from our own page over WebRTC */
    isWebrtc: boolean;
    /** A web chat session - the flowChannel contains WEBCHAT */
    isWebchat: boolean;
    /** CXone Guide chat */
    isGuideChat: boolean;
    /** Anything running in the visitor's browser rather than over the phone */
    isBrowserChannel: boolean;
}

/**
 * A WebRTC demo launched from our own page, rather than a call over the telephone network.
 *
 * Either the flowChannel names it (COGNIGY_WEBRTC), or it is a voice channel carrying the
 * placeholder contact id - a WebRTC call has no CXone contact of its own. The placeholder
 * alone is not enough: the no-dispatcher fallback uses it with flowChannel TESTCHAT.
 */
export const isWebRtcInteraction = (data: Record<string, any>): boolean => {
    const flowChannel = String((data && data.flowChannel) || "").toUpperCase().trim();
    const contactId = String((data && data.contactId) || "").trim();
    return flowChannel.indexOf("WEBRTC") !== -1
        || (flowChannel.indexOf("VOICE") !== -1 && contactId === PLACEHOLDER_CONTACT_ID);
};

/** Classifies context.data by the channel the interaction arrived on. */
export const classifyChannel = (data: Record<string, any>): IChannelKind => {
    const flowChannel = String((data && data.flowChannel) || "").toUpperCase().trim();

    const isWebchat = flowChannel.indexOf("WEBCHAT") !== -1;
    const isWebrtc = isWebRtcInteraction(data);
    // WebRTC also says VOICE, so it has to be taken out of the telephony case explicitly
    const isTelephony = flowChannel.indexOf("VOICE") !== -1 && !isWebrtc;
    const isGuideChat = flowChannel === "CHAT";

    return {
        isTelephony,
        isWebrtc,
        isWebchat,
        isGuideChat,
        isBrowserChannel: isWebrtc || isWebchat
    };
};
