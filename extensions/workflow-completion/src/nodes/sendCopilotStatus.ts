import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

interface ISendCopilotStatusParams extends INodeFunctionBaseParams {
	config: {
		status: "Complete" | "Failed";
		data?: Record<string, unknown> | null;
	};
}

export const sendCopilotStatusNode = createNodeDescriptor({
	type: "sendCopilotStatus",
	defaultLabel: "Send Status to CXone Copilot",
	summary: "Sends workflow completion status (success or failure) to CXone Copilot.",

	tags: ["workflow", "completion", "terminal"],

	fields: [
		{
			key: "status",
			label: "Status",
			description: "Select whether the workflow completed successfully or failed",
			type: "select",
			params: {
				options: [
					{ label: "Success", value: "Complete" },
					{ label: "Failure", value: "Failed" }
				]
			},
			defaultValue: "Complete"
		},
		{
			key: "data",
			label: "Additional Data",
			description: "Optional JSON data to include in the output",
			type: "json"
		}
	],

	form: [
		{ type: "field", key: "status" },
		{ type: "field", key: "data" }
	],

	function: async ({ cognigy, config }: ISendCopilotStatusParams) => {
		const { api, input } = cognigy;

		try {
			const metrics = {
				sessionId: input.sessionId as string | undefined,
				channel: input.channel as string | undefined,
				language: input.language as string | undefined,
				completionTimestamp: Date.now()
			};

			const outputData: Record<string, unknown> = {
				status: config.status,
				metrics,
				...(config.data != null && Object.keys(config.data).length > 0 && { data: config.data })
			};

			api.say("", outputData);
			api.addToContext("sendCopilotStatus", outputData, "simple");
			api.log("debug", `Status sent to CXone Copilot: ${config.status}`);
		} catch (error) {
			api.log("error", `Failed to send status to CXone Copilot: ${(error as Error).message}`);
		}
	}
});
