type Participant = "Bot" | "Patron";
type Action = "End" | "Escalate";
export type MediaType = "Voice" | "Digital";

interface Transcript {
  participantId: Participant;
  messageBody: string;
  messageContentType: "TRANSCRIPT";
  utcDateTime: string;
}

interface SelfServiceSessionDetails {
  transcriptPublishSettingOption: "PUBLISH_TRANSCRIPTS_ONLY";
  sessionCompletionType: "CONTAINED" | "ESCALATED";
  sessionCompletionDetails: string;
  transcriptSummary: string;
  transcripts: Transcript[];
}

interface CognigyPayload {
  vendorId: string;
  busId: string;
  virtualAgentId: string;
  contactId: string;
  contactState: "SELF_SERVICE";
  mediaType: MediaType;
  selfServiceSessionDetails: SelfServiceSessionDetails;
}

interface ConversationItem {
  role: "user" | "assistant";
  type: "input" | "output";
  payload: {
    text?: string | null;
    data?: any;
  };
  timestamp: number;
}

// TMS expects messageBody to be a string. A Cognigy message can carry a rich payload, a number or
// nothing at all in payload.text, so it is always coerced before it goes on the wire.
function toMessageBody(text: any): string {
  if (text === null || text === undefined) return "";
  if (typeof text === "string") return text;
  if (typeof text === "object") return JSON.stringify(text);
  return String(text);
}

// TMS wants to know which kind of interaction the transcript came from. "Auto" follows the same
// rule the rest of the extension uses to tell voice from chat: the Cognigy channel name.
export function resolveMediaType(channel?: string, configured?: string): MediaType {
  if (configured === "Voice" || configured === "Digital") return configured;
  return String(channel || "").toLowerCase().includes("voice") ? "Voice" : "Digital";
}

export default function transformConversation(conversation: ConversationItem[], action: Action, contactId: string, businessNumber: string, mediaType: MediaType = "Voice"): CognigyPayload {
  const transcripts: Transcript[] = conversation
    // keep the messages that carry text - a data-only message (e.g. a custom payload or quick
    // replies) would otherwise show up as a blank line in the CXone transcript
    .filter(item => toMessageBody(item.payload.text).trim() !== "")
    .map(item => {
      const participantId: Participant = item.role === "assistant" ? "Bot" : "Patron";
      const messageBody = toMessageBody(item.payload.text);
      const date = new Date(item.timestamp);
      const utcDateTime = date.toISOString().replace(/\.\d{3}Z$/, (ms => {
        const msStr = date.getMilliseconds().toString().padStart(3, "0");
        return `.${msStr}`;
      })());

      return {
        participantId,
        messageBody,
        messageContentType: "TRANSCRIPT",
        utcDateTime
      };
    });

  return {
    vendorId: "Cognigy",
    busId: businessNumber,
    virtualAgentId: "",
    contactId: contactId,
    contactState: "SELF_SERVICE",
    mediaType: mediaType,
    selfServiceSessionDetails: {
      transcriptPublishSettingOption: "PUBLISH_TRANSCRIPTS_ONLY",
      sessionCompletionType: action === "End" ? "CONTAINED" : "ESCALATED",
      sessionCompletionDetails: action === "End" ? "User Asked to End Conversation" : "User Escalated Conversation to Live Agent",
      transcriptSummary: "",
      transcripts: transcripts
    }
  };
}