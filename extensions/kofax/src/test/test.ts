
// if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_DEFAULT_REGION) {
//     console.error("ERROR: Please set standard AWS credential environment variables: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_DEFAULT_REGION.");
//     process.exit(2);
// }

import { runRobotNode, IRunRobotParams } from '../nodes/runRobot';


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


async function testRunRobot(): Promise<void> {

    const params: IRunRobotParams = {
        cognigy,
        childConfigs: <any>{},
        nodeId: "xyz",

        config: {
            connection: {
                username: "Peter",
                password: "123"
            },

            rpaServer: "https://cb74c6a12872.ngrok.io",
            projectName: "Default Project",
            robotName: "Robot1",
            inputAs: "variables",
            variables: [],
            includeInjectDetails: true,
            json: {},
            timeout: 2000,
            resultAttribute: "resultAttribute",
            storeLocation: "input",
            inputKey: "runRobot",
            contextKey: "runRobot",
        }
    };


    await runRobotNode.function(params);

    console.log("testRunRobot(): Got result:", cognigy.input.runRobot);
}



async function test(): Promise<void> {
    await testRunRobot();
}

test();
