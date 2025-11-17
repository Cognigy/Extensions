import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
// Load the SDK:
import * as AWS from 'aws-sdk';


export interface ILambdaInvokeParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			region: string;
			accessKeyId: string;
			secretAccessKey: string;
		};

		functionName: string;
		payload: string;
		qualifier: string;
		invocationType: "Event" | "RequestResponse" | "DryRun";
		logType: "None" | "Tail";
		clientContext: string;
		outputInputKey: string;
		outputContextKey: string;
	};
}

export const lambdaInvokeNode = createNodeDescriptor({
	type: "lambdaInvoke",
	defaultLabel: "Lambda Invoke",
	fields: [
		{
			key: "connection",
			label: "AWS Connection",
			type: "connection",
			params: {
				connectionType: "aws",
				required: true
			}
		},
		{
			key: "functionName",
			label: "Function Name/ARN",
			type: "cognigyText",
			params: {
				required: true
			}
		},
		{
			key: "payload",
			label: "Payload",
			type: "json",
			defaultValue: "",
		},
		{
			key: "qualifier",
			label: "Qualifier (version or alias)",
			type: "cognigyText",
			params: {
				required: false
			}
		},
		{
			key: "invocationType",
			label: "InvocationType",
			type: "select",
			defaultValue: "RequestResponse",
			params: {
				options: [
					{
						label: "RequestResponse",
						value: "RequestResponse"
					},
					{
						label: "Event",
						value: "Event"
					},
					{
						label: "DryRun",
						value: "DryRun"
					},
				]
			}
		},
		{
			key: "logType",
			label: "Log Type",
			type: "select",
			defaultValue: "None",
			params: {
				options: [
					{
						label: "None",
						value: "None"
					},
					{
						label: "Tail",
						value: "Tail"
					}
				]
			}
		},
		{
			key: "clientContext",
			label: "Client Context",
			type: "json",
		},
		{
			key: "outputInputKey",
			label: "Input Key (in ci) to store Result",
			type: "cognigyText",
			defaultValue: "awsLambdaInvokeResult",
		},
		{
			key: "outputContextKey",
			label: "Context Key (in cc) to store Result",
			type: "cognigyText",
			defaultValue: "",
		}
	],
	sections: [
		{
			// Having this in a section is temporary fix to JSON input not being labelled:
			key: "payloadSection",
			label: "Payload",
			defaultCollapsed: false,
			fields: [
				"payload",
			]
		},
		{
			key: "optionsSection",
			label: "Lambda Invoke options",
			defaultCollapsed: true,
			fields: [
				"qualifier",
				"invocationType",
				"logType",
				"clientContext"
			]
		},
		{
			key: "outputSection",
			label: "Output",
			defaultCollapsed: false,
			fields: [
				"outputInputKey",
				"outputContextKey",
			]
		},

	],
	form: [
		{ type: "field", key: "connection" },
		{ type: "field", key: "functionName" },
		{ type: "section", key: "payloadSection" },
		{ type: "section", key: "optionsSection" },
		{ type: "section", key: "outputSection" },
	],
	appearance: {
		color: "#FF9900"
	},
	function: async ({ cognigy, config }: ILambdaInvokeParams) => {

		const { connection, functionName, qualifier, payload, invocationType, logType, clientContext, outputInputKey, outputContextKey } = config;
		if (!connection) throw new Error('aws.LambdaInvoke: The Connection data is missing.');
		if (!functionName) throw new Error('aws.LambdaInvoke: The Function Name is missing.');

		const { region, accessKeyId, secretAccessKey } = connection;
		if (!region) throw new Error(`aws.LambdaInvoke: AWS 'region' is missing from the connection data.`);
		if (!accessKeyId) throw new Error(`aws.LambdaInvoke: AWS 'accessKeyId' is missing from the connection data.`);
		if (!secretAccessKey) throw new Error(`aws.LambdaInvoke: AWS 'secretAccessKey' is missing from the connection data.`);


		AWS.config.update({ region, accessKeyId, secretAccessKey });
		const lambda = new AWS.Lambda();

		let realPayload = payload;
		// Payload must be a string: Force if not:
		if (payload && typeof payload !== 'string') {
			if (typeof payload === 'object') {
				realPayload = JSON.stringify(payload);
			} else {
				realPayload = String(payload);
			}
		}

		const result = await lambda.invoke(
			{
				FunctionName: functionName,
				Payload: realPayload || undefined,
				Qualifier: qualifier || undefined,
				InvocationType: invocationType || undefined,
				LogType: logType || undefined,
				ClientContext: clientContext || undefined
			})
			.promise();

		// Convert the result Payload from string to object:
		if (result) {
			if (result.Payload && typeof result.Payload === 'string') {
				result.Payload = JSON.parse(result.Payload);
			}
			// If we have 'LogResult' (by way of LogType:'Tail'), then it's base64 encoded, up to 4kB:
			// Let's unencode it:
			if (result.LogResult) {
				const buff = Buffer.from(result.LogResult, 'base64');
				result.LogResult = buff.toString('ascii');
			}
		}

		// Store the result in 0, 1 or both output keys, per user config:
		if (outputInputKey) {
			cognigy.input[outputInputKey] = result;
		}
		if (outputContextKey) {
			cognigy.api.addToContext(outputContextKey, result, 'simple');
		}
	}
});