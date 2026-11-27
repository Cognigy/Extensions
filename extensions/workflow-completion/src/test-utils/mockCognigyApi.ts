/// <reference types="jest" />

export interface MockApi {
	say: jest.Mock;
	log: jest.Mock;
	addToContext: jest.Mock;
}

export interface MockCognigy {
	api: MockApi;
	input: Record<string, unknown>;
	context: Record<string, unknown>;
}

export const createMockCognigy = (overrides: Partial<MockCognigy> = {}): MockCognigy => {
	const api: MockApi = {
		say: jest.fn(),
		log: jest.fn(),
		addToContext: jest.fn()
	};

	const base: MockCognigy = {
		api,
		input: {
			sessionId: "test-session-id",
			channel: "adminconsole",
			language: "en-US"
		},
		context: {}
	};

	return {
		...base,
		...overrides,
		api: { ...api, ...(overrides as any).api }
	};
};
