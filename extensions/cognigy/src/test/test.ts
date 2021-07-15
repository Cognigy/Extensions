
if (!process.env.CAI_APIKEY) {
    console.error("ERROR: Please set in environment: CAI_APIKEY=<An API Key to access your Cognigy.AI platform>");
    process.exit(2);
}

import { IGetConversationParams, getConversationNode } from '../nodes/getConversation';


const cognigy = {
    api: <any>{
        log: (level: "debug" | "warn" | "error", msg: string) => {
            switch (level) {
                case "debug": return console.debug(msg);
                case "warn": return console.warn(msg);
                case "error": return console.error(msg);
            }
        },
        setContext: (key: string, value: any) => {
            cognigy.context = value;
        }
    },
    input: <any>{},
    context: <any>{},
    profile: <any>{}
};


async function TEST_getConversationNode(): Promise<void> {

    const params: IGetConversationParams = {
        cognigy,
        childConfigs: <any>{},
        nodeId: "xyz",

        config: {
            connection: {
                apiKey: process.env.CAI_APIKEY
            },

            odataBaseUrl: 'https://odata-au-02.cognigy.ai',
            // 1 or both of these next 2 must be non-blank:
            userId: 'p.nann@cognigy.com',
            sessionId: 'fffce495-a071-49da-800f-e7f160519a0d',
            outputType: 'json',
            tzOffset: '-10',

            storeLocation: 'input',
            inputKey: 'getConversation',
            contextKey: '',
        }
    };


    await getConversationNode.function(params);

    console.log("Got result:\n" + JSON.stringify(cognigy.input.getConversation, null, 4));
}

async function test(): Promise<void> {
    await TEST_getConversationNode();
}

test();
