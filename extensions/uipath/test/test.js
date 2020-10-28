const getTransactionStatus = require('../build/nodes/getTransactionStatus');

const cognigy = {
    api:{
        log: (level, msg) => {
            switch (level) {
                case "debug": return console.debug(msg);
                case "warn": return console.warn(msg);
                case "error": return console.error(msg);
            }
        },
        setContext: (key, value) => {
            cognigy.context = value;
        }
    },
    input: {},
    context: {},
    profile: {}
};


async function executeFunction () {

    const params = {
        cognigy,
        childConfigs: {},
        nodeId: "xyz",

        config: {
            instanceInfo: {
                accountLogicalName: "",
                tenantLogicalName: ""
            },
            accessToken: '',
            transactionItemId: '',
            storeLocation: "input",
            inputKey: "runRobot",
            contextKey: "runRobot",
        }
        //     accessToken: "23456",
        //     releaseKey: "fsdfhsfdhfsd",
        //     robotIds: [213455],
    };

    await getTransactionStatus.getOutputInformationSynch.function((params));

    console.log("Result:", cognigy.input.runRobot);
}



async function test() {
    await executeFunction();
}

test();