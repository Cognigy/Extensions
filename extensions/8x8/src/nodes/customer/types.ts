import type { INodeFunctionBaseParams } from '@cognigy/extension-tools';
import type StoreLocationName from '../../constants/StoreLocationName';
import type { SearchGenericParams } from '../../types';
import type { I8x8SimpleConnection } from '../../connections/8x8SimpleConnection';

export interface CustomerAddress {
  street1: string
  street2: string
  city: string
  state: string
  zip: string
  country: string
}

export interface CustomerData {
  firstName: string
  lastName: string
  company: string
  pbx: string
  comments: string
  accountNumber: number
  customerType: string
  email: string
  voice: string
  alternative: string
  fax: string
  address1: CustomerAddress
  address2: CustomerAddress
}

export interface SearchCustomerParams extends SearchGenericParams {
  filter$firstName?: string
  filter$lastName?: string
  filter$email?: string
  filter$voice?: string
  filter$company?: string
  filter$customerType?: string
  filter$accountNum?: string
  filter$customFields?: Record<string, string>
}

export interface IGetCustomerParams extends INodeFunctionBaseParams {
  config: {
    connection: I8x8SimpleConnection
    storeLocation: StoreLocationName
    contextKey?: string
    inputKey?: string
  } & SearchCustomerParams
}
