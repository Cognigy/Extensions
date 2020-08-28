
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_DEFAULT_REGION) {
    console.error("ERROR: Please set standard AWS credential environment variables: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_DEFAULT_REGION.");
    process.exit(2);
}

import { ILambdaInvokeParams, lambdaInvokeNode } from '../nodes/lambdaInvoke';
import { IS3PutObjectParams, s3PutObjectNode } from '../nodes/s3PutObject';
import { IS3GetObjectParams, s3GetObjectNode } from '../nodes/s3GetObject';


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


async function testLambdaInvoke(): Promise<void> {

    const params: ILambdaInvokeParams = {
        cognigy,
        childConfigs: <any>{},
        nodeId: "xyz",

        config: {
            connection: {
                region: "ap-southeast-2",
                accessKeyId: "AKIAV2IMRXNKDDFYAFD4",
                secretAccessKey: "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",
            },

            functionName: "cognigyRetailGetOrderDetails",
            payload: JSON.stringify({ orderNum: "56789" }),
            qualifier: '',
            invocationType: "RequestResponse",
            logType: "None",
            clientContext: undefined,
            outputInputKey: "awsLambdaInvokeResult",
            outputContextKey: "awsLambdaInvokeResult",
        }
    };


    await lambdaInvokeNode.function(params);

    console.log("Got result:\n" + JSON.stringify(cognigy.input.awsLambdaInvokeResult, null, 4));
}

async function testPut(): Promise<void> {

    const outputKey = "awsPutResult";

    const params: IS3PutObjectParams = {
        cognigy,
        childConfigs: <any>{},
        nodeId: "xyz",

        config: {
            connection: {
                region: process.env.AWS_DEFAULT_REGION,
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },

            bucket: "peters-cognigy-publicread-bucket",
            key: 'shared/s3TestWrite.json',
            dataFormat: "text",
            data: `{ "foo": "bar" }`,
            acl: 'bucket-owner-full-control',
            storeLocation: 'input',
            inputKey: outputKey,
            contextKey: outputKey,
        }
    };


    await s3PutObjectNode.function(params);

    console.log("Got Put result:\n" + JSON.stringify(cognigy.input[outputKey], null, 4));
}

async function testGet(): Promise<void> {
    const outputKey = "awsGetResult";

    const params: IS3GetObjectParams = {
        cognigy,
        childConfigs: <any>{},
        nodeId: "xyz",

        config: {
            connection: {
                region: process.env.AWS_DEFAULT_REGION,
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },

            bucket: "peters-cognigy-publicread-bucket",
            key: 'shared/s3TestWrite.json',
            dataFormat: "base64",
            storeLocation: 'input',
            inputKey: outputKey,
            contextKey: outputKey,
        }
    };


    await s3GetObjectNode.function(params);

    console.log("Got Get result:\n" + JSON.stringify(cognigy.input[outputKey], null, 4));
}

async function test(): Promise<void> {
    await testLambdaInvoke();
    await testPut();
    await testGet();
}

test();
