import { createExtension } from "@cognigy/extension-tools";

import { getParcelInfo } from "./nodes/getParcelInfo";
import { apiKeyConnection } from "./connections/apiKeyConnection";
export default createExtension({
nodes: [
getParcelInfo,

],
connections: [apiKeyConnection]});