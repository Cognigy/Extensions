import { createExtension } from "@cognigy/extension-tools";
import { azureKeyVaultConnection } from "./connections/azureKeyVaultConnection";
import { generateBlobSasUrl } from "./nodes/generateBlobSasUrl";
import { getSecretFromKeyVault } from "./nodes/getSecretFromKeyVault";

export default createExtension({
  nodes: [getSecretFromKeyVault, generateBlobSasUrl],
  connections: [azureKeyVaultConnection],
  options: { label: "Azure Cloud Storage" }
});