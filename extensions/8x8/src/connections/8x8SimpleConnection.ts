import type { IConnectionSchema } from '@cognigy/extension-tools';

export const simpleConnection: IConnectionSchema = {
  type: 'eightbyeightsimple',
  label: '8x8',
  fields: [
    { fieldName: 'apiKey' },
    { fieldName: 'baseUrl' },
    { fieldName: 'tenantId' }
  ]
};

export interface I8x8SimpleConnection {
  apiKey: string
  baseUrl: string
  tenantId: string
}
