/// <reference types="jest" />

// Global Jest setup for workflow-completion extension tests
// Always provide a Jest-mockable fetch in the Node environment
(global as any).fetch = jest.fn();



