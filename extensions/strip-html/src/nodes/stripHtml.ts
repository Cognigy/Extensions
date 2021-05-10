import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { stripHtml } from "string-strip-html";

export interface IStripHtmlParams extends INodeFunctionBaseParams {
  config: {
    text: string;
    storeLocation: string;
    contextKey: string;
    inputKey: string;
  };
}

export const stripHtmlNode = createNodeDescriptor({
  type: "stripHtml",
  defaultLabel: "Strip HTML",
  fields: [
    {
      key: "incoming",
      label: "Text with HTML",
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
      defaultValue: "stripText",
      condition: { key: "storeLocation", value: "input" }
    },
    {
      key: "contextKey",
      type: "cognigyText",
      label: "Context Key to store Result",
      defaultValue: "stripText",
      condition: { key: "storeLocation", value: "context" }
    }
  ],
  sections: [
    {
      key: "stripHtml",
      label: "Strip HTML properties",
      defaultCollapsed: false,
      fields: ["text"]
    },
    {
      key: "storageOption",
      label: "Storage Option",
      defaultCollapsed: true,
      fields: ["storeLocation", "inputKey", "contextKey"]
    }
  ],
  form: [
    { type: "section", key: "stripHtml" },
    { type: "section", key: "storageOption" }],
  function: async ({ cognigy, config }: IStripHtmlParams) => {
    const { api } = cognigy;
    const { text, storeLocation, contextKey, inputKey } = config;

    function store(result: any): void {
      if (storeLocation === "context") {
        api.addToContext(contextKey, result, "simple");
      } else { // @ts-ignore
        api.addToInput(inputKey, result);
      }
    }

    if (text) {
      store(stripHtml(text).result);
    }
  }
});
