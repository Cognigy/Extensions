import type { CaseData } from '../types';

const getMockCaseJson = (): CaseData => ({
  accountNum: 123456,
  caseNum: 67890,
  subject: 'My printer doesn’t work',
  description: 'This customer downloaded the new driver XXXX v5.4 of the driver, installed it and since then the printer doesn’t work.',
  status: 'Open',
  priority: 'High',
  severity: 'Information',
  category: 'Default',
  project: 'Default',
  visibility: 'Private',
  mediaType: 'Phone',
  assignedTo: 'jsmith',
  assignedDate: '01122010',
  createdBy: 'bpower',
  createdDate: '02152000',
  closedBy: '',
  closedDate: '',
  lastActivityDate: '01232000'
});

export default getMockCaseJson;
