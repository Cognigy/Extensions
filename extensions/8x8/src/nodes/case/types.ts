import type { INodeFunctionBaseParams } from '@cognigy/extension-tools';
import type StoreLocationName from '../../constants/StoreLocationName';
import type { SearchGenericParams } from '../../types';
import type { I8x8SimpleConnection } from '../../connections/8x8SimpleConnection';

export interface CaseData {
  accountNum: number
  caseNum: number
  subject: string
  description: string
  status: string
  priority: string
  severity: string
  category: string
  project: string
  visibility: string
  mediaType: string
  assignedTo: string
  assignedDate: string
  createdBy: string
  createdDate: string
  closedBy: string
  closedDate: string
  lastActivityDate: string
}

export interface SearchCaseParams extends SearchGenericParams {
  filter$caseNum?: string
  filter$accountNum?: string
  filter$lastName?: string
  filter$company?: string
  filter$status?: string
  filter$project?: string
  filter$subject?: string
  filter$customFields?: Record<string, string>
}

export interface IGetCaseParams extends INodeFunctionBaseParams {
  config: {
    connection: I8x8SimpleConnection
    storeLocation: StoreLocationName
    contextKey?: string
    inputKey?: string
  } & SearchCaseParams
}
