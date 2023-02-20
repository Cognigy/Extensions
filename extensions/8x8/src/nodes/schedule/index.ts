import type { INodeDescriptor } from '@cognigy/extension-tools';
import {
  getScheduleNode, onChoice1Node, onChoice2Node, onChoice3Node, onChoice4Node, onChoice5Node, onChoice6Node, onClosedNode, onOpenNode
} from './getSchedule';

export const getScheduleNodes = (): INodeDescriptor[] => [
  getScheduleNode,
  onOpenNode,
  onClosedNode,
  onChoice1Node,
  onChoice2Node,
  onChoice3Node,
  onChoice4Node,
  onChoice5Node,
  onChoice6Node
];
