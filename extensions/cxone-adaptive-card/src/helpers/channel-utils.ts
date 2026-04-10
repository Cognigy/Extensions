export interface IChannelInfo {
    isVoice: boolean;
    isCognigy: boolean;
    isGuideChat: boolean;
    isSms: boolean;
}

/**
 * Detects the active channel from input.channel and the secondary
 * flowChannel (input.data.flowChannel or context.data.flowChannel).
 */
export function detectChannel(input: any, context: any): IChannelInfo {
    const oChannel = (input?.channel || '').toLowerCase().trim();
    const flowChannel = (input?.data?.flowChannel || context?.data?.flowChannel || '').toLowerCase().trim();

    const isVoice =
        oChannel.includes("voice") ||
        flowChannel.includes("voice");

    const isCognigy =
        oChannel.includes("adminconsole") ||
        oChannel.includes("webchat") ||
        oChannel.includes("test") ||
        flowChannel.includes("cognigy_webchat") ||
        flowChannel.includes("testchat");

    const isSms =
        !isVoice && !isCognigy &&
        (oChannel.includes("sms") || flowChannel.includes("sms"));

    const isGuideChat = !isVoice && !isCognigy && !isSms;

    return { isVoice, isCognigy, isGuideChat, isSms };
}
