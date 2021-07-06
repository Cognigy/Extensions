import { IBlueprismWsParams, blueprismWebservice } from '../nodes/blueprismWebservice.js';

const cognigy = {
  api: {
    log: (level, msg) => {
      switch (level) {
        case "debug": return console.debug(`\nDEBUG: ${msg}`);
        case "warn": return console.warn(`\nWARN: ${msg}`);
        case "error": return console.error(`\nERROR: ${msg}`);
      }
    },
    addToInput: (key: string, value: any) => {
      cognigy.input[key] = value;
    },
    addToContext: (key: string, value: any) => {
      cognigy.context[key] = value;
    }
  },
  input: {},
  context: {},
  profile: {}
};

async function triggerWebservice(): Promise<void> {
  const params: IBlueprismWsParams = {
    cognigy,
    childConfigs: <any>{},
    nodeId: "xyz",

    config: {
      url: 'https://webhook.site/7c356b57-0fab-48e1-ae2e-8c1cb5c2139c',
      connection: { username: "username", password: "password" },
      soapBody: "<AddressUpdate xmlns=\"blueprism:webservice:addressupdate\">\n <User>max.mustermann</User>\n <FirstName>Max</FirstName>\n <LastName>Mustermann</LastName>\n <Street>Speditionstrasse 1</Street>\n <City>Dusseldorf</City>\n <State>NRW</State>\n <ZIPCode>40200</ZIPCode>\n</AddressUpdate>",
      storeLocation: "context",
      inputKey: "blueprism",
      contextKey: "blueprism"
    }
  };

  await blueprismWebservice.function((params));

  console.log("Resulting input:", cognigy.input);
  console.log("Resulting context:", cognigy.context);
}

triggerWebservice();
