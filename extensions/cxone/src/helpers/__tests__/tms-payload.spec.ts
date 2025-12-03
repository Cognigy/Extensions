/// <reference types="jest" />

import transformConversation from "../tms-payload";

describe("transformConversation (TMS payload)", () => {
  it("maps conversation items to transcripts correctly", () => {
    const baseTime = Date.now();
    const conversation = [
      {
        role: "user",
        type: "input",
        payload: { text: "Hi" },
        timestamp: baseTime
      },
      {
        role: "assistant",
        type: "output",
        payload: { text: "Hello there" },
        timestamp: baseTime + 1000
      },
      {
        role: "user",
        type: "input",
        payload: { text: null },
        timestamp: baseTime + 2000
      }
    ] as any;

    const result = transformConversation(conversation, "End", "contact-1", "BU-1");

    expect(result.vendorId).toBe("Cognigy");
    expect(result.busId).toBe("BU-1");
    expect(result.contactId).toBe("contact-1");
    expect(result.contactState).toBe("SELF_SERVICE");
    expect(result.mediaType).toBe("Voice");

    const details = result.selfServiceSessionDetails;
    expect(details.transcriptPublishSettingOption).toBe("PUBLISH_TRANSCRIPTS_ONLY");
    expect(details.sessionCompletionType).toBe("CONTAINED");
    expect(details.sessionCompletionDetails).toBe("User Asked to End Conversation");

    // Only two transcripts, because one input has no text
    expect(details.transcripts).toHaveLength(2);
    const [first, second] = details.transcripts;
    expect(first.participantId).toBe("Patron");
    expect(first.messageBody).toBe("Hi");
    expect(first.messageContentType).toBe("TRANSCRIPT");

    expect(second.participantId).toBe("Bot");
    expect(second.messageBody).toBe("Hello there");
    expect(second.messageContentType).toBe("TRANSCRIPT");
  });

  it("sets sessionCompletionType and details based on action", () => {
    const conversation: any[] = [];

    const endResult = transformConversation(conversation, "End", "cid", "BU");
    expect(endResult.selfServiceSessionDetails.sessionCompletionType).toBe("CONTAINED");
    expect(endResult.selfServiceSessionDetails.sessionCompletionDetails).toBe("User Asked to End Conversation");

    const escResult = transformConversation(conversation, "Escalate", "cid", "BU");
    expect(escResult.selfServiceSessionDetails.sessionCompletionType).toBe("ESCALATED");
    expect(escResult.selfServiceSessionDetails.sessionCompletionDetails).toBe("User Escalated Conversation to Live Agent");
  });

  it("formats utcDateTime with milliseconds padded", () => {
    const timestamp = new Date("2024-01-01T00:00:00.5Z").getTime();
    const conversation = [
      {
        role: "user",
        type: "input",
        payload: { text: "Hi" },
        timestamp
      }
    ] as any;

    const result = transformConversation(conversation, "End", "cid", "BU");
    const transcript = result.selfServiceSessionDetails.transcripts[0];
    // Current implementation produces an ISO-like string ending with `.xxx` (without trailing Z)
    expect(transcript.utcDateTime).toMatch(/\.\d{3}$/);
  });
});


