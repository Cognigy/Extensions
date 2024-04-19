import { createExtension } from "@cognigy/extension-tools";
import { signGoogleCloudStorageUrl } from "./nodes/signGoogleCloudStorageUrl";
import { googleCloudStorageConnection } from "./connections/googleCloudStorageConnection";

export default createExtension({
  nodes: [signGoogleCloudStorageUrl],
  connections: [googleCloudStorageConnection],
  options: { label: "Google Cloud Storage" }
});