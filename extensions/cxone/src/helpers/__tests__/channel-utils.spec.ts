/// <reference types="jest" />

import { isVoiceChannel, getChannelType } from "../channel-utils";
import { CognigyInput, ChannelType } from "../../types";

describe("channel-utils", () => {
    describe("isVoiceChannel", () => {
        it("should return true for channels containing 'voice' (case-insensitive)", () => {
            expect(isVoiceChannel({ channel: "voice" } as CognigyInput)).toBe(true);
            expect(isVoiceChannel({ channel: "VOICE" } as CognigyInput)).toBe(true);
            expect(isVoiceChannel({ channel: "Voice" } as CognigyInput)).toBe(true);
            expect(isVoiceChannel({ channel: "voice-channel" } as CognigyInput)).toBe(true);
            expect(isVoiceChannel({ channel: "my-voice-test" } as CognigyInput)).toBe(true);
            expect(isVoiceChannel({ channel: "test-voice-channel" } as CognigyInput)).toBe(true);
        });

        it("should return false for non-voice channels", () => {
            expect(isVoiceChannel({ channel: "webchat" } as CognigyInput)).toBe(false);
            expect(isVoiceChannel({ channel: "testchat" } as CognigyInput)).toBe(false);
            expect(isVoiceChannel({ channel: "chat" } as CognigyInput)).toBe(false);
            expect(isVoiceChannel({ channel: "sms" } as CognigyInput)).toBe(false);
            expect(isVoiceChannel({ channel: "email" } as CognigyInput)).toBe(false);
        });

        it("should return false for undefined input", () => {
            expect(isVoiceChannel(undefined)).toBe(false);
        });

        it("should return false for null input", () => {
            expect(isVoiceChannel(null as any)).toBe(false);
        });

        it("should return false for input without channel property", () => {
            expect(isVoiceChannel({} as CognigyInput)).toBe(false);
            expect(isVoiceChannel({ data: {} } as CognigyInput)).toBe(false);
        });

        it("should return false for empty string channel", () => {
            expect(isVoiceChannel({ channel: "" } as CognigyInput)).toBe(false);
        });
    });

    describe("getChannelType", () => {
        it("should return 'voice' for channels containing 'voice' (case-insensitive)", () => {
            expect(getChannelType({ channel: "voice" } as CognigyInput)).toBe("voice");
            expect(getChannelType({ channel: "VOICE" } as CognigyInput)).toBe("voice");
            expect(getChannelType({ channel: "Voice" } as CognigyInput)).toBe("voice");
            expect(getChannelType({ channel: "voice-channel" } as CognigyInput)).toBe("voice");
            expect(getChannelType({ channel: "my-voice-test" } as CognigyInput)).toBe("voice");
        });

        it("should return 'webchat' for channels containing 'webchat' (case-insensitive)", () => {
            expect(getChannelType({ channel: "webchat" } as CognigyInput)).toBe("webchat");
            expect(getChannelType({ channel: "WEBCHAT" } as CognigyInput)).toBe("webchat");
            expect(getChannelType({ channel: "Webchat" } as CognigyInput)).toBe("webchat");
            expect(getChannelType({ channel: "webchat-channel" } as CognigyInput)).toBe("webchat");
            expect(getChannelType({ channel: "my-webchat-test" } as CognigyInput)).toBe("webchat");
        });

        it("should return 'testchat' for channels containing 'testchat' (case-insensitive)", () => {
            expect(getChannelType({ channel: "testchat" } as CognigyInput)).toBe("testchat");
            expect(getChannelType({ channel: "TESTCHAT" } as CognigyInput)).toBe("testchat");
            expect(getChannelType({ channel: "Testchat" } as CognigyInput)).toBe("testchat");
            expect(getChannelType({ channel: "testchat-channel" } as CognigyInput)).toBe("testchat");
            expect(getChannelType({ channel: "my-testchat-test" } as CognigyInput)).toBe("testchat");
        });

        it("should return 'chat' as default for unrecognized channels", () => {
            expect(getChannelType({ channel: "chat" } as CognigyInput)).toBe("chat");
            expect(getChannelType({ channel: "sms" } as CognigyInput)).toBe("chat");
            expect(getChannelType({ channel: "email" } as CognigyInput)).toBe("chat");
            expect(getChannelType({ channel: "unknown" } as CognigyInput)).toBe("chat");
            expect(getChannelType({ channel: "other-channel" } as CognigyInput)).toBe("chat");
        });

        it("should return 'chat' for undefined input", () => {
            expect(getChannelType(undefined)).toBe("chat");
        });

        it("should return 'chat' for null input", () => {
            expect(getChannelType(null as any)).toBe("chat");
        });

        it("should return 'chat' for input without channel property", () => {
            expect(getChannelType({} as CognigyInput)).toBe("chat");
            expect(getChannelType({ data: {} } as CognigyInput)).toBe("chat");
        });

        it("should return 'chat' for empty string channel", () => {
            expect(getChannelType({ channel: "" } as CognigyInput)).toBe("chat");
        });

        it("should prioritize 'voice' over 'webchat' and 'testchat'", () => {
            // If channel contains both "voice" and "webchat", voice should take priority
            expect(getChannelType({ channel: "voice-webchat" } as CognigyInput)).toBe("voice");
            expect(getChannelType({ channel: "voice-testchat" } as CognigyInput)).toBe("voice");
            expect(getChannelType({ channel: "webchat-voice" } as CognigyInput)).toBe("voice");
        });

        it("should prioritize 'webchat' over 'testchat' when no voice", () => {
            expect(getChannelType({ channel: "webchat-testchat" } as CognigyInput)).toBe("webchat");
            expect(getChannelType({ channel: "testchat-webchat" } as CognigyInput)).toBe("webchat");
        });
    });
});

