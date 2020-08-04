import express, { text } from "express";
import axios from 'axios';

const app = express();
const port = 8080;


app.get("/", (req, res) => {
    setInterval(async () => {
        let agentResponse = await getAgentMessage(
            req.query.liveAgentUrl,
            req.query.liveAgentAffinity,
            req.query.liveAgentSessionKey
        );

        await injectCognigyMessage(
            agentResponse.message,
            req.query.userId,
            req.query.sessionId,
            req.query.URLToken,
            req.query.data,
            req.query.environment
        )
    }, 4000)
});


app.listen(port, () => {
    console.log(`[Salesforce Live Chat Server] started at http://localhost:${port}`);
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
async function injectCognigyMessage(text: string | any, userId: string | any, sessionId: string | any, URLToken: string | any, data: any | any, environment: string | any) {
    try {
        const response = await axios({
            method: "POST",
            url: `https://api-${environment}.cognigy.ai/endpoint/inject`,
            data: {
                userId,
                sessionId,
                URLToken,
                text,
                data
            }
        });
    } catch (error) {
        throw new Error(error.message);
    }
}

/**
 * Get an Agent message
 * @arg {String} `liveAgentUrl` The Salesforce Live Agent Url
 * @arg {String} `liveAgentAffinity` Session Affinity. Stored in the Session Response.
 * @arg {String} `liveAgentSessionKey` Session Key. Stored in the Sessoin Response.
 * @arg {String} `contextStore` Where to store the result
 * @arg {Boolean} `stopOnError` Whether to stop on error or continue
 */
async function getAgentMessage(liveAgentUrl: string | any, liveAgentAffinity: string | any, liveAgentSessionKey: string | any): Promise<IAgentMessage> {
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

        messagesResponse.data.messages.forEach((message: any) => {
            if (message.type === "ChatMessage") {
                return {
                    message: message.message.text
                };
            } else {
                return {
                    message: ''
                };
            }
        });

    } catch (error) {
        return {
            message: '',
            error: error.message
        };
    }
}
