import { createExtension } from "@cognigy/extension-tools/build"
import { terminateCallNode } from "./nodes/terminateCall"
import { forwardCallNode } from "./nodes/forwardCall"
import { playNode } from "./nodes/play"
import { stopPlayNode } from "./nodes/stopPlay"
import { recordingStartNode } from "./nodes/recordingStart"
import { recordingStopNode } from "./nodes/recordingStop"
import { sendDataNode } from "./nodes/data"
import { promptForNumberNode } from "./nodes/promptForNumber"
import { promptForMultipleChoice } from "./nodes/multipleChoicePrompt"
import { speakNode } from "./nodes/speak"
import { inactivityTimerNode } from "./nodes/inactivityTimer"
import { transcriptionSwitchNode } from "./nodes/transcriptionSwitch"
import { aggregateInputNode } from "./nodes/aggregateInput"
import { referCallNode } from "./nodes/referCall"
import {
    checkOutboundResultNode,
    onOutboundDefault,
    onOutboundFailure,
    onOutboundSuccess,
    onOutboundTermination,
} from "./nodes/checkOutboundResult"
import {
    checkReferResultNode,
    onReferDefault,
    onReferFailure,
    onReferSuccess,
} from "./nodes/checkReferResult"
import { changeDefaultsNode } from "./nodes/changeDefault"

export default createExtension({
    nodes: [
        changeDefaultsNode,
        promptForNumberNode,
        promptForMultipleChoice,
        recordingStartNode,
        recordingStopNode,
        playNode,
        stopPlayNode,
        sendDataNode,
        forwardCallNode,
        referCallNode,
        terminateCallNode,
        speakNode,
        checkOutboundResultNode,
        onOutboundSuccess, // child
        onOutboundFailure, // child
        onOutboundTermination, // child
        onOutboundDefault, // child
        checkReferResultNode,
        onReferSuccess, // child
        onReferFailure, // child
        onReferDefault, // child
        transcriptionSwitchNode,
        inactivityTimerNode,
        aggregateInputNode,
    ],
    options: {
        label: "VIER Voice",
    },
})
