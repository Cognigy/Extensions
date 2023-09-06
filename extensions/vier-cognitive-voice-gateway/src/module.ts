import { createExtension } from '@cognigy/extension-tools/build';
import { terminateCallNode } from './nodes/terminateCall';
import { forwardCallNode } from './nodes/forwardCall';
import { bridgeCallNode } from './nodes/bridgeCall';
import { playNode } from './nodes/play';
import { stopPlayNode } from "./nodes/stopPlay";
import { recordingStartNode } from './nodes/recordingStart';
import { recordingStopNode } from './nodes/recordingStop';
import { sendDataNode } from './nodes/data';
import { promptForNumberNode } from './nodes/promptForNumber';
import { promptForMultipleChoice } from './nodes/multipleChoicePrompt';
import { speakNode } from './nodes/speak';
import { inactivityTimerNode } from './nodes/inactivityTimer';
import { setSpeechtoTextServiceNode } from './nodes/setSpeechToTextService';
import { aggregateInputNode } from "./nodes/aggregateInput";
import {
  checkOutboundResultNode,
  onOutboundDefault,
  onOutboundFailure,
  onOutboundSuccess,
  onOutboundTermination,
} from './nodes/checkOutboundResult';
import {
  checkReferResultNode,
  onReferDefault, 
  onReferFailure,
  onReferSuccess
} from './nodes/checkReferResult';
import { referCallNode } from './nodes/referCall';

export default createExtension({
  nodes: [
    promptForNumberNode,
    promptForMultipleChoice,
    recordingStartNode,
    recordingStopNode,
    playNode,
    stopPlayNode,
    sendDataNode,
    forwardCallNode,
    bridgeCallNode,
    referCallNode,
    terminateCallNode,
    speakNode,
    checkOutboundResultNode,
    onOutboundSuccess, // child
    onOutboundFailure, // child
    onOutboundTermination, // child
    onOutboundDefault,  // child
    checkReferResultNode,
    onReferSuccess, // child
    onReferFailure, // child
    onReferDefault, // child
    setSpeechtoTextServiceNode,
    inactivityTimerNode,
    aggregateInputNode,
  ],
  options: {
    label: 'VIER Voice',
  },
});
