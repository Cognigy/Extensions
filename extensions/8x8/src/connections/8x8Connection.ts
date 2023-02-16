import type { IConnectionSchema } from '@cognigy/extension-tools';

export const connection: IConnectionSchema = {
  type: 'eightbyeight',
  label: '8x8',
  fields: [
    { fieldName: 'tenantId' },
    { fieldName: 'crmApiUsername' },
    { fieldName: 'crmApiPassword' },
    { fieldName: 'dataRequestToken' },
    { fieldName: 'actionRequestToken' },
    { fieldName: 'clusterBaseUrl' }
  ]
};

export interface I8x8Connection {
  tenantId: string
  crmApiUsername: string
  crmApiPassword: string
  dataRequestToken: string
  actionRequestToken: string
  clusterBaseUrl: string
}
