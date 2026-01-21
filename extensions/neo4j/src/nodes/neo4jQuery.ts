import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';

export interface INeo4jQueryParams extends INodeFunctionBaseParams {
	config: {
		input: string;
		model: string;
		neo4jConnection: {
			Username: string;
			Password: string;
			Host: string;
		};
		openAiConnection: {
			openAiKey: string;
		},
		storeLocation: "input" | "context";
		inputKey: string;
		contextKey: string;
	};
}
export const neo4jQuery = createNodeDescriptor({
	type: "neo4jQuery",
	defaultLabel: "Neo4j Query",
	fields: [
		{
			key: "model",
			label: "OpenAI LLM Model",
			type: "cognigyText",
			defaultValue: "gpt-4.1-mini",
			params: {
				required: true
			}
		},
		{
			key: "openAiConnection",
			label: "OpenAI Connection",
			type: "connection",
			params: {
				connectionType: "openAiApiKey",
				required: true
			}
		},
		{
			key: "neo4jConnection",
			label: "Neo4j Connection",
			type: "connection",
			params: {
				connectionType: "neo4jConnection",
				required: true
			}
		},
		{
			key: "input",
			label: "Smart Query",
			description: "Freeform query that will be converted into a Cypher query.",
			type: "cognigyText",
			params: {
				required: true
			},
			defaultValue: "[[snippet-eyJ0eXBlIjoiaW5wdXQiLCJsYWJlbCI6IlRleHQiLCJzY3JpcHQiOiJpbnB1dC50ZXh0In0=]]"
		},

		{
			key: "storeLocation",
			type: "select",
			label: "Store Location",
			defaultValue: "input",
			params: {
				options: [
					{
						label: "Input",
						value: "input",
					},
					{
						label: "Context",
						value: "context",
					},
				],
			},
		},
		{
			key: "inputKey",
			type: "cognigyText",
			label: "Input Key",
			defaultValue: "neo4jQueryResult",
			condition: {
				key: "storeLocation",
				value: "input",
			},
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key",
			defaultValue: "neo4jQueryResult",
			condition: {
				key: "storeLocation",
				value: "context",
			},
		},
	],
	sections: [
		{
			key: "storage",
			label: "Storage",
			defaultCollapsed: false,
			fields: ["storeLocation", "inputKey", "contextKey"],
		},
		{
			key: "advanced",
			label: "Advanced",
			defaultCollapsed: true,
			fields: ["neo4jConnection", "model", "openAiConnection"],
		}
	],
	form: [
		{ type: "field", key: "input" },
		{ type: "field", key: "intents" },
		{ type: "field", key: "overwriteIntent" },
		{ type: "section", key: "storage" },
		{ type: "section", key: "advanced" },
	],
	appearance: {
		color: "black"
	},
	function: async ({ cognigy, config }: INeo4jQueryParams) => {
		const { api } = cognigy;
		const { input: userInput, neo4jConnection, openAiConnection, model, storeLocation, inputKey, contextKey } = config;
		const { Username, Password, Host } = neo4jConnection;
		const { openAiKey } = openAiConnection;

		try {
			const neo4jAuth = Buffer.from(`${Username}:${Password}`).toString('base64');
			const neo4jAxios = axios.create({
				baseURL: `https://${Host}`,
				headers: {
					'Authorization': `Basic ${neo4jAuth}`,
					'Content-Type': 'application/json',
				}
			});

			const propResult = await neo4jAxios.post('/db/neo4j/query/v2', {
				statement: `
					CALL db.schema.nodeTypeProperties()
					YIELD nodeLabels, propertyName, propertyTypes
					RETURN nodeLabels, propertyName, propertyTypes
				`
			});

			const nodeProperties = {};
			for (const value of propResult.data.data.values) {
				const labels = value[0];
				const prop = value[1];
				const types = value[2];

				labels.forEach(label => {
					if (!nodeProperties[label]) nodeProperties[label] = [];
					nodeProperties[label].push({ property: prop, types });
				});
			}

			const schemaResult = await neo4jAxios.post('/db/neo4j/query/v2', {
				statement: `CALL db.schema.visualization()`
			});

			const graphData = schemaResult.data.data.values[0];
			const nodes = graphData[0];
			const relationships = graphData[1];

			const nodeIdToLabel = {};
			nodes.forEach(node => {
				const nodeId = node.elementId;
				const label = node.labels[0];
				nodeIdToLabel[nodeId] = label;
			});

			const relationshipTypes = relationships.map(rel => ({
				type: rel.type,
				startLabel: nodeIdToLabel[rel.startNodeElementId],
				endLabel: nodeIdToLabel[rel.endNodeElementId]
			}));

			const systemPrompt = formatSchemaForPrompt({ nodeProperties, relationshipTypes });

			const openAiResponse = await axios({
				method: "post",
				url: `https://api.openai.com/v1/chat/completions`,
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${openAiKey}`
				},
				data: {
					"model": model,
					"messages": [
						{ role: 'system', content: systemPrompt },
						{ role: 'user', content: `User asked: "${userInput}". Generate Cypher.` },
					],
					"temperature": 0.1
				}
			});

			const cypher = openAiResponse.data.choices[0].message.content.trim();

			if (cypher === "No valid Cypher possible") {
				throw new Error("No valid Cypher possible");
			}

			const finalResult = await neo4jAxios.post('/db/neo4j/query/v2', {
				statement: cypher
			});

			const records = finalResult.data.data.values.map(value => {
				// Convert the array values to object based on the fields
				const fields = finalResult.data.data.fields;
				return Object.fromEntries(
					fields.map((field, index) => [field, value[index]])
				);
			});

			const resultObj = {
				cypher,
				result: records
			};

			if (storeLocation === "context") {
				api.addToContext?.(contextKey, resultObj, "simple");
			} else if (storeLocation === "input") {
				api.addToInput(inputKey, resultObj);
			}
		} catch (error) {
			throw new Error(error);
		}
	}
});

function formatSchemaForPrompt(schemaInfo: any): string {
	const { nodeProperties, relationshipTypes } = schemaInfo;

	let prompt = "You are an expert Cypher query generator for a Neo4j knowledge graph.\n\n";

	prompt += "The available graph structure is:\n\n";

	// --- List Nodes and Properties
	prompt += "Nodes:\n";
	for (const [label, props] of Object.entries(nodeProperties)) {
		prompt += `- ${label} with properties:\n`;
		if (Array.isArray(props)) {
			props.forEach((prop: any) => {
				prompt += `    - ${prop.property} (${prop.types.join(", ")})\n`;
			});
		}
	}

	prompt += "\n";

	// --- List Relationships
	prompt += "Relationships:\n";
	relationshipTypes.forEach((rel: any) => {
		prompt += `- ${rel.startLabel} -[:${rel.type}]-> ${rel.endLabel}\n`;
	});

	prompt += "\n";

	// --- Strict Instructions
	prompt += `Rules:\n`;
	prompt += `- Only use the above node labels, properties, and relationship types.\n`;
	prompt += `- Do NOT invent new labels or relationships.\n`;
	prompt += `- If the query cannot be answered with the available structure, respond exactly with:\n`;
	prompt += "No valid Cypher possible";

	return prompt;
}