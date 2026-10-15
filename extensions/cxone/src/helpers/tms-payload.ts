import { ConversationItem, HandoverAction } from "../types";

type Participant = "Bot" | "Patron";

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
  mediaType: "Voice";
  selfServiceSessionDetails: SelfServiceSessionDetails;
}

export default function transformConversation(conversation: ConversationItem[], action: HandoverAction, contactId: string, businessNumber: string): CognigyPayload {
  const transcripts: Transcript[] = conversation
    .filter(item => item.type === "output" || (item.type === "input" && item.payload.text))
    .map(item => {
      const participantId: Participant = item.role === "assistant" ? "Bot" : "Patron";
      const messageBody = item.payload.text ?? "";
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
    mediaType: "Voice",
    selfServiceSessionDetails: {
      transcriptPublishSettingOption: "PUBLISH_TRANSCRIPTS_ONLY",
      sessionCompletionType: action === "End" ? "CONTAINED" : "ESCALATED",
      sessionCompletionDetails: action === "End" ? "User Asked to End Conversation" : "User Escalated Conversation to Live Agent",
      transcriptSummary: "",
      transcripts: transcripts
    }
  };
}
