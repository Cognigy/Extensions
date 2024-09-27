import { createExtension } from "@cognigy/extension-tools";
import { azureKeyVaultConnection } from "./connections/azureKeyVaultConnection";
import { getSecretFromKeyVault } from "./nodes/getSecretFromKeyVault";
import { generateBlobSasUrl } from "./nodes/generateBlobSasUrl";
import { processReturnLabel } from "./nodes/processReturnLabel";
import { moveBlob } from "./nodes/moveBlob";

export default createExtension({
  connections: [azureKeyVaultConnection],
  nodes: [
    getSecretFromKeyVault,
    generateBlobSasUrl,
    processReturnLabel,
    moveBlob
  ],
  options: { label: "Puma Azure Storage" }
});