import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

export interface IWorkflowCompletionParams extends INodeFunctionBaseParams {
	config: {
		status: "Complete" | "Failed";
	};
}

export const workflowCompletionNode = createNodeDescriptor({
	type: "workflowCompletion",
	defaultLabel: "Workflow Completion",
	summary: "Mark workflow completion with status and metrics",

	tags: ["workflow", "completion", "terminal"],

	fields: [
		{
			key: "status",
			label: "Completion Status",
			description: "Select whether the workflow completed successfully or failed",
			type: "select",
			params: {
				options: [
					{
						label: "Complete",
						value: "Complete"
					},
					{
						label: "Failed",
						value: "Failed"
					}
				]
			},
			defaultValue: "Complete"
		}
	],

	sections: [
		{
			key: "advanced",
			label: "Output",
			defaultCollapsed: true,
			fields: [
				"status"
			]
		}
	],

	form: [
		{ type: "field", key: "status" }
	],

	appearance: {
		color: "#4CAF50", // Green for completion
		textColor: "white",
		variant: "mini"
	},

	function: async ({ cognigy, config }: IWorkflowCompletionParams) => {
		const { api, input, context } = cognigy;

		try {
			// Gather available session metrics
			const metrics = gatherSessionMetrics(input, context);

			// Prepare output data
			const outputData = {
				status: config.status,
				metrics
			};

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