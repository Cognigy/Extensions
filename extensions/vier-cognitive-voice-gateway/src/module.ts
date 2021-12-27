import { createExtension } from '@cognigy/extension-tools/build';

import { terminateCallNode } from './nodes/terminateCall';
import { forwardCallNode } from './nodes/forwardCall';
import { bridgeCallNode } from './nodes/bridgeCall';
import { playNode } from './nodes/play';
import { recordingStartNode } from './nodes/recordingStart';
import { recordingStopNode } from './nodes/recordingStop';
import { sendDataNode } from './nodes/data';
import { promptForNumberNode } from './nodes/numberPrompt';
import { promptForMultipleChoice } from './nodes/multipleChoicePrompt';
import { speakNode } from './nodes/speak';

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
  ],
  options: {
    label: 'VIER Voice'
  }
});