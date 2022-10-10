import { createExtension } from "@cognigy/extension-tools";
import { CheckEnrollmentStatusNode } from "./nodes/CheckEnrollmentStatus";
import { StartEnrollmentProcessNode } from "./nodes/StartEnrollmentProcess";
import { StartVerificationProcessNode } from "./nodes/StartVerificationProcess";
import { DeleteUserVerificationInformationNode } from "./nodes/DeleteUserVerificationInformation";

export default createExtension({
	nodes: [
		CheckEnrollmentStatusNode,
		StartEnrollmentProcessNode,
		StartVerificationProcessNode,
		DeleteUserVerificationInformationNode
	],
	options: {
		label: "AudioCodes Voice Verification"
	}
});