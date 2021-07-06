import { createExtension } from "@cognigy/extension-tools";
import { blueprismWebservice as blueprismWebservice } from "./nodes/blueprismWebservice";
import { blueprismConnection as blueprismConnection } from "./connections/blueprismConnection";

export default createExtension({
  nodes: [blueprismWebservice],
  connections: [blueprismConnection]
});
