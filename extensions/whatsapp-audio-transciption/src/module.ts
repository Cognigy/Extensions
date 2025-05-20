import { createExtension } from "@cognigy/extension-tools";
import { transcribeWhatsappAudio } from "./nodes/transcribeWhatsappAudio";

export default createExtension({
  connections: [],
  nodes: [transcribeWhatsappAudio],
  options: { label: "Whatsapp Audio Transcription" }
});