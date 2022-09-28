import { createExtension } from '@cognigy/extension-tools/build';
import { terminateCallNode } from './nodes/terminateCall';
import { forwardCallNode } from './nodes/forwardCall';
import { bridgeCallNode } from './nodes/bridgeCall';
import { playNode } from './nodes/play';
import { recordingStartNode } from './nodes/recordingStart';
import { recordingStopNode } from './nodes/recordingStop';
import { sendDataNode } from './nodes/data';
import { promptForNumberNode } from './nodes/promptForNumber';
import { promptForMultipleChoice } from './nodes/multipleChoicePrompt';
import { speakNode } from './nodes/speak';
import { inactivityTimerNode } from './nodes/inactivityTimer';
import { setSpeechtoTextServiceNode } from './nodes/setSpeechToTextService';
import { checkOutboundResultNode, onOutboundDefault, onOutboundFailure, onOutboundSuccess, onOutboundTermination } from './nodes/checkOutboundResult';

export default createExtension({
  nodes: [
    promptForNumberNode,
    promptForMultipleChoice,
    recordingStartNode,
    recordingStopNode,
    playNode,
    sendDataNode,
    forwardCallNode,
    bridgeCallNode,
    terminateCallNode,
    speakNode,
    checkOutboundResultNode,
    onOutboundSuccess, // child
    onOutboundFailure, // child
    onOutboundTermination, // child
    onOutboundDefault,  // child
    setSpeechtoTextServiceNode,
    inactivityTimerNode,
  ],
  options: {
    label: 'VIER Voice'
  }
});