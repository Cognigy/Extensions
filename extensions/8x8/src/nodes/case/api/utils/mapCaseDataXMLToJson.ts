import getParsedXMLItems from '../../../../utils/getParsedXMLItems';
import type { CaseData } from '../../types';

const mapFunc = (caseData: Record<string, any>): CaseData => ({
  accountNum: caseData.ACCOUNTNUM,
  caseNum: caseData.CASENUM,
  subject: caseData.SUBJECT,
  description: caseData.DESCRIPTION,
  status: caseData.STATUS,
  priority: caseData.PRIORITY,
  severity: caseData.SEVERITY,
  category: caseData.CATEGORY,
  project: caseData.PROJECT,
  visibility: caseData.VISIBILITY,
  mediaType: caseData.MEDIATYPE,
  assignedTo: caseData.ASSIGNEDTO,
  assignedDate: caseData.ASSIGNEDDATE,
  createdBy: caseData.CREATEDBY,
  createdDate: caseData.CREATEDDATE,
  closedBy: caseData.CLOSEDBY,
  closedDate: caseData.CLOSEDDATE,
  lastActivityDate: caseData.LASTACTDATE
});

const mapCaseDataXMLToJson = (xmlData: string): CaseData[] => getParsedXMLItems<CaseData>(xmlData, mapFunc);

export default mapCaseDataXMLToJson;
