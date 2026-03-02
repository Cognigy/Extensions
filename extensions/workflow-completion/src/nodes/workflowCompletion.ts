import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

export interface IWorkflowCompletionParams extends INodeFunctionBaseParams {
	config: {
		status: "Complete" | "Failed";
		data?: string;
	};
}

export const workflowCompletionNode = createNodeDescriptor({
	type: "workflowCompletion",
	defaultLabel: "Send Status to Copilot",
	summary: "This node sends the status (success or failure) of the session to CXone Copilot.",

	tags: ["workflow", "completion", "terminal"],

	fields: [
		{
			key: "status",
			label: "Status",
			description: "Select whether the workflow completed successfully or failed",
			type: "select",
			params: {
				options: [
					{
						label: "Success",
						value: "Complete"
					},
					{
						label: "Failure",
						value: "Failed"
					}
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

	sections: [
		{
			key: "advanced",
			label: "Output",
			defaultCollapsed: true,
			fields: [
				"status",
				"data"
			]
		}
	],

	form: [
		{ type: "field", key: "status" },
		{ type: "field", key: "data" }
	],


	function: async ({ cognigy, config }: IWorkflowCompletionParams) => {
		const { api, input, context } = cognigy;

		try {
			// Gather available session metrics
			const metrics = gatherSessionMetrics(input, context);

			// Prepare output data
			const outputData: any = {
				status: config.status,
				metrics
			};

			// Add optional data field if provided
			if (config.data) {
				try {
					const parsedData = typeof config.data === 'string'
						? JSON.parse(config.data)
						: config.data;
					outputData.data = parsedData;
				} catch (error) {
					api.log("warning", `Invalid JSON in data field: ${error.message}`);
				}
			}

			// Execute say with empty string as requested
			api.say("", outputData);

			// Add to context for flow usage
			api.addToContext("workflowCompletion", outputData, "simple");

			// Log completion for debugging
			api.log("debug", `Workflow marked as ${config.status}`);

		} catch (error) {
			api.log("error", `Error in workflow completion node: ${error.message}`);

			// Still mark as failed if there was an error
			const fallbackData = {
				status: "Failed",
				metrics: {}
			};

			api.addToContext("workflowCompletion", fallbackData, "simple");
		}
	}
});

/**
 * Attempts to gather session metrics from available Cognigy objects
 * Returns empty object if metrics are not accessible
 */
function gatherSessionMetrics(input: any, context: any): Record<string, any> {
	const metrics: Record<string, any> = {};

	try {
		// Try to extract session ID
		if (input?.sessionId) {
			metrics.sessionId = input.sessionId;
		} else if (input?.userId) {
			metrics.sessionId = input.userId;
		} else if (context?.sessionId) {
			metrics.sessionId = context.sessionId;
		}

		// Try to extract conversation/session timing
		if (input?.sessionStartTime || context?.sessionStartTime) {
			const startTime = input.sessionStartTime || context.sessionStartTime;
			const now = Date.now();
			if (typeof startTime === 'number') {
				metrics.conversationDuration = now - startTime;
			}
		}

		// Try to extract interaction counts
		if (input?.transcript && Array.isArray(input.transcript)) {
			metrics.inputCount = input.transcript.filter((msg: any) => msg.source === 'user').length;
			metrics.responseCount = input.transcript.filter((msg: any) => msg.source === 'bot').length;
			metrics.totalInteractions = input.transcript.length;
		}

		// Try to extract step count or flow position
		if (context?.stepCount !== undefined) {
			metrics.stepCount = context.stepCount;
		} else if (context?.flowPosition !== undefined) {
			metrics.flowPosition = context.flowPosition;
		}

		// Try to extract channel information
		if (input?.channel) {
			metrics.channel = input.channel;
		}

		// Try to extract language/locale
		if (input?.locale) {
			metrics.locale = input.locale;
		} else if (input?.language) {
			metrics.language = input.language;
		}

		// Add timestamp
		metrics.completionTimestamp = Date.now();

	} catch (error) {
		// If any error occurs while gathering metrics, return empty object
		console.warn("Could not gather session metrics:", error.message);
	}

	return metrics;
}