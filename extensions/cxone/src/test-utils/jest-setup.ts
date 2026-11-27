/// <reference types="jest" />

// Global Jest setup for CXone tests
// Always provide a Jest-mockable fetch in the Node environment
(global as any).fetch = jest.fn();



