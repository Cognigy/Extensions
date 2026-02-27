/**
 * Channel detection utilities
 */

import { CognigyInput, ChannelType } from "../types";

/**
 * Check if the current channel is a voice channel
 */
export function isVoiceChannel(input: CognigyInput | undefined): boolean {
    if (!input || !input.channel) {
        return false;
    }
    return input.channel.toLowerCase().includes("voice");
}

/**
 * Get channel type from input
 */
export function getChannelType(input: CognigyInput | undefined): ChannelType {
    if (!input || !input.channel) {
        return "chat";
    }
    const channel = input.channel.toLowerCase();
    if (channel.includes("voice")) {
        return "voice";
    }
    if (channel.includes("webchat")) {
        return "webchat";
    }
    if (channel.includes("testchat")) {
        return "testchat";
    }
    return "chat";
}

