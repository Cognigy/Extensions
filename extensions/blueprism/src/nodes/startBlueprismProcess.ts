import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';

export interface IStartBlueprismProcessParams extends INodeFunctionBaseParams {
  config: {
    connection: { username: string; password: string };
    processWSDL: string;
    processName: string;
    storeLocation: string;
    contextKey: string;
    inputKey: string;
  };
}

export const startBlueprismProcess = createNodeDescriptor({
  type: "startBlueprismProcess",
  defaultLabel: "Start Process",
  fields: [
    {
      key: "connection",
      label: "Blueprism Credentials",
      type: "connection",
      params: { connectionType: "blueprismCredentials", required: true }
    },
    {
      key: "processWSDL",
      label: "Process WSDL",
      type: "cognigyText",
      defaultValue: "",
      params: {
        placeholder: "http://host:port/path/to/webservice?wsdl",
        required: true
      }
    },
    {
      key: "processName",
      label: "Process Name",
      type: "cognigyText",
      defaultValue: "",
      params: {
        placeholder: "",
        required: true
      }
    },
    {
      key: "storeLocation",
      type: "select",
      label: "Where to store the result",
      params: {
        options: [
          { label: "Input", value: "input" },
          { label: "Context", value: "context" }
        ],
        required: true
      },
      defaultValue: "input"
    },
    {
      key: "inputKey",
      type: "cognigyText",
      label: "Input Key to store Result",
      defaultValue: "blueprism",
      condition: { key: "storeLocation", value: "input" }
    },
    {
      key: "contextKey",
      type: "cognigyText",
      label: "Context Key to store Result",
      defaultValue: "blueprism",
      condition: { key: "storeLocation", value: "context" }
    }
  ],
  sections: [
    {
      key: "blueprismRequest",
      label: "Blueprism Request Properties",
      defaultCollapsed: false,
      fields: ["connection", "processWSDL", "processName"]
    },
    {
      key: "storageOption",
      label: "Storage Option",
      defaultCollapsed: true,
      fields: ["storeLocation", "inputKey", "contextKey"]
    }
  ],
  form: [
    { type: "section", key: "blueprismRequest" },
    { type: "section", key: "storageOption" }],
  function: async ({ cognigy, config }: IStartBlueprismProcessParams) => {
    const { api } = cognigy;
    const { connection, processWSDL, processName, storeLocation, contextKey, inputKey } = config;
    const { username, password } = connection;

    function store(result: any): void {
      if (storeLocation === "context") {
        api.addToContext(contextKey, result, "simple");
      } else { // @ts-ignore
        api.addToInput(inputKey, result);
      }
    }

    api.say(`${processWSDL}, ${processName}, ${storeLocation}, ${contextKey}, ${inputKey}`);
    axios({
      method: 'post',
      url: processWSDL,
      headers: {
        'Content-Type': 'text/xml'
      },
      auth: { username, password },
      data: `
        <soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xmlns:xsd="http://www.w3.org/2001/XMLSchema"
          xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
          xmlns:urn="urn:blueprism:webservice:${processName}">
            <soapenv:Header/>
            <soapenv:Body>
              <urn:${processName} soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"/>
            </soapenv:Body>
        </soapenv:Envelope>
        `
    }).then(response => {
      store(response.data);
    }).catch(error => {
      console.log(error);
      store({
        'errorMessage': error.message,
        'response': error.response
      });
      store('test test test');
    });
  }
});
