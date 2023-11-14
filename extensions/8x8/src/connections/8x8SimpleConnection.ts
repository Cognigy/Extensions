import type { IConnectionSchema } from '@cognigy/extension-tools';

export const simpleConnection: IConnectionSchema = {
  type: 'eightbyeightsimple',
  label: '8x8',
  fields: [
    { fieldName: 'apiKey' },
    { fieldName: 'clusterBaseUrl' },
    { fieldName: 'tenantId' }
  ]
};

export interface I8x8SimpleConnection {
  apiKey: string
  clusterBaseUrl: string
  tenantId: string
}
