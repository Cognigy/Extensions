/// <reference types="jest" />

export interface MockApi {
  log: jest.Mock;
  addToContext: jest.Mock;
  output: jest.Mock;
  setProfileKey?: jest.Mock;
}

export interface MockCognigy {
  api: MockApi;
  input: any;
  context: any;
}

export const createMockCognigy = (overrides: Partial<MockCognigy> = {}): MockCognigy => {
  const api: MockApi = {
    log: jest.fn(),
    addToContext: jest.fn(),
    output: jest.fn()
  };

  const base: MockCognigy = {
    api,
    input: {
      channel: "voice",
      transcript: []
    },
    context: {}
  };

  return {
    ...base,
    ...overrides,
    api: { ...api, ...(overrides as any).api }
  };
};


