
if (!process.env.CGY_API_KEY) {
    console.error("ERROR: Please set your Cognigy API key in CGY_API_KEY in environment.");
    process.exit(2);
}

import { getConversationNode, IGetConversationParams } from '../nodes/get-conversation';
import { INodeExecutionCognigyObject } from '@cognigy/extension-tools/build/interfaces/descriptor';


/** Dummied up 'cognigy' object as needed inside Node function: */
const cognigy: INodeExecutionCognigyObject = {
    api: <any>{
        log: (level: "debug" | "warn" | "error", msg: string) => {
            switch (level) {
                case "debug": return console.debug(msg);
                case "warn": return console.warn(msg);
                case "error": return console.error(msg);
            }
        },
        setContext: (key: string, value: any) => {
            cognigy.context[key] = value;
        }
    },
    input: <any>{},
    context: <any>{},
    profile: <any>{}
};


async function testGetConversation(): Promise<void> {

    cognigy.api.setContext('DEBUG', ['get-conversation']);

    const params: IGetConversationParams = {
        cognigy,
        childConfigs: <any>{},
        nodeId: "xyz",

        config: {
            connection: {
                apiKey: process.env.CGY_API_KEY
            },

            odataBaseUrl: "https://odata-beta-v4.cognigy.ai",
            storeLocation: "input",
            inputKey: "getConversation",
            contextKey: "getConversation",
            outputType: "json",
            tzOffset: "+10",
            userId: "p.nann@cognigy.com",
            sessionId: "4f25b3ce-e8f0-47f9-a433-2210284b8c3b",

        }
    };

    await getConversationNode.function(params);

    console.log("Got result:\n" + JSON.stringify(cognigy.input.getConversation, null, 4));
}


async function test(): Promise<void> {
    await testGetConversation();
}

test();
