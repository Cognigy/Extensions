import type { CustomerData } from '../types';

const getMockCustomerJson = (): CustomerData => ({
  firstName: 'Vlad',
  lastName: 'Puscas',
  company: '',
  pbx: '',
  comments: '',
  accountNumber: 10000052,
  customerType: 'Default',
  email: 'vlad.puscas@8x8.com',
  voice: '',
  alternative: '',
  fax: '',
  address1: {
    street1: '',
    street2: '',
    city: '',
    state: '',
    zip: '',
    country: ''
  },
  address2: {
    street1: '',
    street2: '',
    city: '',
    state: '',
    zip: '',
    country: ''
  }
});

export default getMockCustomerJson;
