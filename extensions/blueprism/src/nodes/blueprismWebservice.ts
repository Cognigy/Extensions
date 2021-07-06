import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';
import * as xmljs from 'xml-js';

export interface IBlueprismWsParams extends INodeFunctionBaseParams {
  config: {
    url: string;
    connection: { username: string; password: string };
    soapBody: any;
    storeLocation: string;
    contextKey: string;
    inputKey: string;
  };
}

export const blueprismWebservice = createNodeDescriptor({
  type: "blueprismWs",
  defaultLabel: "Blueprism WS",
  fields: [
    {
      key: "url",
      label: "Web Service URL",
      type: "cognigyText",
      description: 'URL at which the Blueprism web service is available (without "?wsdl" in the end)',
      params: { placeholder: "http(-s)://host:port/path/to/webservice", required: true }
    },
    {
      key: "connection",
      label: "Blueprism Connection",
      type: 'connection',
      description: 'Username and password used to authorize with the Blueprism webservice',
      params: { connectionType: "blueprism", required: true }
    },
    {
      key: "soapBody",
      label: "SOAP Envelope Body",
      type: "xml",
      description: "The XML inserted into the <soapenv:Body> part of the request. It will be used as the web service execution parameter",
      params: { required: true }
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
      label: "Input key at which the result will be stored",
      defaultValue: "blueprism",
      condition: { key: "storeLocation", value: "input" }
    },
    {
      key: "contextKey",
      type: "cognigyText",
      label: "Context key at which the result will be stored",
      defaultValue: "blueprism",
      condition: { key: "storeLocation", value: "context" }
    }
  ],
  sections: [
    {
      key: "blueprism",
      label: "Blueprism Request Properties",
      defaultCollapsed: false,
      fields: ["connection", "url", "soapBody"]
    },
    {
      key: "storage",
      label: "Storage Option",
      defaultCollapsed: true,
      fields: ["storeLocation", "inputKey", "contextKey"]
    }
  ],
  form: [
    { type: "section", key: "blueprism" },
    { type: "section", key: "storage" }
  ],
  preview: { key: "url", type: "text" },
  function: async ({ cognigy, config }: IBlueprismWsParams) => {
    const { api } = cognigy;
    const { connection, url, soapBody, storeLocation, contextKey, inputKey } = config;
    const { username, password } = connection;

    const store = (result: any) => {
      if (storeLocation === 'context') {
        api.addToContext(contextKey, result, 'simple');
      } else { // @ts-ignore
        api.addToInput(inputKey, result);
      }
    };

    let requestBody = '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">' +
      `<soap:Header/><soap:Body>${soapBody}</soap:Body></soap:Envelope>`;

    let xmlResponse;
    try {
      const response = await axios({
        method: 'post',
        url: url,
        headers: { 'Content-Type': 'text/xml' },
        auth: { username, password },
        data: requestBody
      });
      xmlResponse = response.data;
    } catch (error) {
      api.log('error', `Request to ${url} resulted in error: ${JSON.stringify(error.toJSON())}`);
      store(error.toJSON());
      return;
    }

    try {
      const xmlJson = xmljs.xml2js(xmlResponse, { compact: true, nativeType: true, ignoreAttributes: true });
      const responseSoapEnvelope = findByKeyEnding(xmlJson, 'Envelope');
      const responseSoapBody = findByKeyEnding(responseSoapEnvelope, 'Body');
      const simplifiedJson = simplifyJson(responseSoapBody);
      store(simplifiedJson);
    } catch (error) {
      api.log('error', error);
      store(error);
    }
  }
});

const findByKeyEnding: any = (obj: any, keyEnding: string) => {
  for (const objectKey of Object.keys(obj)) {
    if (objectKey.endsWith(keyEnding)) {
      return obj[objectKey];
    }
  }
};

const simplifyJson: any = (xmlJson: any) => {
  const converted = {};
  Object.keys(xmlJson).forEach(key => {
    const element = xmlJson[key];
    converted[key] = element._text ? element._text : simplifyJson(element);
  });
  return converted;
};
