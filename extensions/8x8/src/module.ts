import {createExtension} from "@cognigy/extension-tools";
import {smsConnection} from "./connections/8x8ConnectionSMS";
import {simpleConnection} from "./connections/8x8SimpleConnection";
import {getSMSNodes} from "./nodes/SMS";
import {getCaseNodes} from "./nodes/case";
import {getCustomerNodes} from "./nodes/customer";
import {getDataAugmentationNode} from "./nodes/dataAugmentation";
import {getScheduleNodes} from "./nodes/schedule";
import {getTestConditionOfQueueNode} from "./nodes/testConditionOfQueue";
import {getVoiceHandoverNode} from "./nodes/voiceHandover";
import {getScheduleHandbackToBotFlowNode} from "./nodes/scheduleHandbackToBotFlow";
import {getEndConversationNode} from "./nodes/endConversation";

export default createExtension({
    nodes: [
        ...getSMSNodes(),
        ...getCustomerNodes(),
        ...getScheduleNodes(),
        ...getTestConditionOfQueueNode(),
        ...getCaseNodes(),
        ...getVoiceHandoverNode(),
        ...getDataAugmentationNode(),
        ...getScheduleHandbackToBotFlowNode(),
        ...getEndConversationNode()
    ],
    connections: [simpleConnection, smsConnection],
    options: {
        label: "8x8",
    },
});
