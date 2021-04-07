import { createExtension } from "@cognigy/extension-tools";
import { startBlueprismProcess } from "./nodes/startBlueprismProcess";
import { blueprismConnection as blueprismConnection } from "./connections/blueprismConnection";

export default createExtension({
  nodes: [startBlueprismProcess],
  connections: [blueprismConnection]
});
