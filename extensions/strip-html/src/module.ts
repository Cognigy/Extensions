import { createExtension } from "@cognigy/extension-tools";
import { stripHtmlNode } from "./nodes/stripHtml";

export default createExtension({ nodes: [stripHtmlNode] });
