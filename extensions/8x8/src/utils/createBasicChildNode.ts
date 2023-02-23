import type { INodeDescriptor } from '@cognigy/extension-tools';
import { createNodeDescriptor } from '@cognigy/extension-tools';

export interface CreateBasicChildNodeParams {
  type: string
  defaultLabel: string
  parentType: string
}
const createBasicChildNode = ({ type, defaultLabel, parentType }: CreateBasicChildNodeParams): INodeDescriptor => createNodeDescriptor({
  type,
  defaultLabel,
  parentType,
  constraints: {
    editable: false,
    deletable: false,
    creatable: false,
    movable: false,
    placement: {
      predecessor: {
        whitelist: []
      }
    }
  },
  appearance: {
    color: '#61d188',
    textColor: 'white',
    variant: 'mini'
  }
});

export default createBasicChildNode;
