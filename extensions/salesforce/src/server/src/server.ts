import express, { text } from "express";
import axios from 'axios';

const app = express();
const port = 8080;

app.get("/", (req, res) => {
	res.json({
		title: "Cognigy.AI Salesforce Messaging Server",
		repository: {
			url: "https://github.com/Cognigy/Extensions"
		},
		endpoints: [
			{
				endpoint: "/get-agent-messages",
				parameters: [
					{
						liveAgentUrl: {
							type: "string",
							description: "The Salesforce Live Agent URL"
						},
					},
					{
						liveAgentAffinity: {
							type: "string",
							description: "The Salesforce Agent Affinity. Returned by the 'Start Live Chat' Flow Node."
						}
					},
					{
						liveAgentSessionKey: {
							type: "string",
							description: "The Salesforce Live Agent Session Key. Returned by the 'Start Live Chat' Flow Node."
						}
					},
					{
						userId: {
							type: "string",
							description: "The Cognigy User Id. Stored in the 'input' object -> {{input.userId}}"
						},
					},
					{
						sessionId: {
							type: "string",
							description: "The Cognigy Session Id. Stored in the 'input' object -> {{input.sessionId}}"
						}
					},
					{
						URLToken: {
							type: "string",
							description: "The Cognigy URL Token. Stored in the 'input' object -> {{input.URLToken}}"
						}
					}
				]
			}
		]
	});
});

app.get("/get-agent-messages", async (req, res) => {

	const { query } = req;
	const { liveAgentAffinity, liveAgentSessionKey, liveAgentUrl, userId, sessionId, URLToken } = query;

	// check parameters
	if (!liveAgentAffinity || liveAgentSessionKey || liveAgentUrl || userId || sessionId || URLToken) {
		res.status(400);
		res.send({
			error: "Your HTTP Request is missing one of the required parameters."
		});
	} else {
		try {
			await getAgentMessage(
				liveAgentUrl,
				liveAgentAffinity,
				liveAgentSessionKey,
				userId,
				sessionId,
				URLToken
			);
		} catch (error) {
			res.status(500);
			res.json({
				error: "The message could not be send to the user. Please check if the session if still open or try again later."
			});
		}
	}
});


app.listen(port, () => {
	console.log(`[Salesforce Live Chat Server] started at port ${port}`);
});


interface IAgentMessage {
	error?: string;
	message: string;
}

/**
 * Send the Agent message to Cognigy
 * @param text
 * @param userId
 * @param sessionId
 * @param URLToken
 * @param data
 * @param environment
 */
async function injectCognigyMessage(text: string | any, userId: string | any, sessionId: string | any, URLToken: string | any): Promise<void> {
	try {
		await axios({
			method: "POST",
			url: `https://api-dev-v4.cognigy.ai/new//v2.0/endpoint/inject`,
			data: {
				userId,
				sessionId,
				URLToken,
				text,
				data: {}
			}
		});
	} catch (error) {
		throw new Error(error.message);
	}

	return;
}

/**
 * Get an Agent message
 * @arg {String} `liveAgentUrl` The Salesforce Live Agent Url
 * @arg {String} `liveAgentAffinity` Session Affinity. Stored in the Session Response.
 * @arg {String} `liveAgentSessionKey` Session Key. Stored in the Sessoin Response.
 * @arg {String} `contextStore` Where to store the result
 * @arg {Boolean} `stopOnError` Whether to stop on error or continue
 */
async function getAgentMessage(liveAgentUrl: string | any, liveAgentAffinity: string | any, liveAgentSessionKey: string | any, userId: string | any, sessionId: string | any, URLToken: string | any): Promise<IAgentMessage> {
	try {
		const messagesResponse = await axios({
			method: "GET",
			url: `${liveAgentUrl}/chat/rest/System/Messages`,
			headers: {
				"X-LIVEAGENT-SESSION-KEY": liveAgentSessionKey,
				"X-LIVEAGENT-AFFINITY": liveAgentAffinity,
				"X-LIVEAGENT-API-VERSION": "34",
			}
		});

		messagesResponse.data.messages.forEach(async (message: any) => {
			if (message.type === "ChatMessage") {
				await injectCognigyMessage(
					message.message.text,
					userId,
					sessionId,
					URLToken
				);
			} else {
				await injectCognigyMessage(
					'',
					userId,
					sessionId,
					URLToken
				);
			}
		});
	} catch (error) {
		throw new Error(error.message);
	}

	return;
}
