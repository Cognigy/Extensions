import { sendCopilotStatusNode } from "../nodes/sendCopilotStatus";
import { createMockCognigy } from "../test-utils/mockCognigyApi";

// Access the node function typed generically since INodeDescriptor hides its param type
const nodeFunction = (sendCopilotStatusNode as any).function as (params: any) => Promise<void>;

describe("sendCopilotStatusNode", () => {
	describe("node descriptor", () => {
		it("has the correct type", () => {
			expect(sendCopilotStatusNode.type).toBe("sendCopilotStatus");
		});

		it("is tagged as terminal", () => {
			expect((sendCopilotStatusNode as any).tags).toContain("terminal");
		});
	});

	describe("function", () => {
		it("sends Complete status with session metrics", async () => {
			const mock = createMockCognigy({
				input: {
					sessionId: "session-abc",
					channel: "voice",
					language: "en-US"
				}
			});

			await nodeFunction({ cognigy: mock, config: { status: "Complete" } });

			expect(mock.api.say).toHaveBeenCalledTimes(1);
			const [text, outputData] = mock.api.say.mock.calls[0];
			expect(text).toBe("");
			expect(outputData.status).toBe("Complete");
			expect(outputData.metrics.sessionId).toBe("session-abc");
			expect(outputData.metrics.channel).toBe("voice");
			expect(outputData.metrics.language).toBe("en-US");
			expect(typeof outputData.metrics.completionTimestamp).toBe("number");
		});

		it("sends Failed status", async () => {
			const mock = createMockCognigy();

			await nodeFunction({ cognigy: mock, config: { status: "Failed" } });

			const [, outputData] = mock.api.say.mock.calls[0];
			expect(outputData.status).toBe("Failed");
		});

		it("includes optional data when provided", async () => {
			const mock = createMockCognigy();
			const extraData = { ticketId: "TKT-123", reason: "user request" };

			await nodeFunction({ cognigy: mock, config: { status: "Complete", data: extraData } });

			const [, outputData] = mock.api.say.mock.calls[0];
			expect(outputData.data).toEqual(extraData);
		});

		it("omits data field when not provided", async () => {
			const mock = createMockCognigy();

			await nodeFunction({ cognigy: mock, config: { status: "Complete" } });

			const [, outputData] = mock.api.say.mock.calls[0];
			expect(outputData).not.toHaveProperty("data");
		});

		it("omits data field when empty object", async () => {
			const mock = createMockCognigy();

			await nodeFunction({ cognigy: mock, config: { status: "Complete", data: {} } });

			const [, outputData] = mock.api.say.mock.calls[0];
			expect(outputData).not.toHaveProperty("data");
		});

		it("omits data field when null", async () => {
			const mock = createMockCognigy();

			await nodeFunction({ cognigy: mock, config: { status: "Complete", data: null } });

			const [, outputData] = mock.api.say.mock.calls[0];
			expect(outputData).not.toHaveProperty("data");
		});

		it("stores output in context under sendCopilotStatus key", async () => {
			const mock = createMockCognigy();

			await nodeFunction({ cognigy: mock, config: { status: "Complete" } });

			expect(mock.api.addToContext).toHaveBeenCalledWith(
				"sendCopilotStatus",
				expect.objectContaining({ status: "Complete" }),
				"simple"
			);
		});

		it("logs debug message on success", async () => {
			const mock = createMockCognigy();

			await nodeFunction({ cognigy: mock, config: { status: "Complete" } });

			expect(mock.api.log).toHaveBeenCalledWith("debug", expect.stringContaining("Complete"));
		});

		it("logs error and does not throw when api call fails", async () => {
			const mock = createMockCognigy();
			mock.api.say.mockImplementation(() => { throw new Error("API unavailable"); });

			await expect(nodeFunction({ cognigy: mock, config: { status: "Complete" } }))
				.resolves.not.toThrow();

			expect(mock.api.log).toHaveBeenCalledWith("error", expect.stringContaining("API unavailable"));
		});
	});
});
