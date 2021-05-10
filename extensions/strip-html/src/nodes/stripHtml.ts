import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { stripHtml } from "string-strip-html";

export interface IStripHtmlParams extends INodeFunctionBaseParams {
  config: {
    textWithHtml: string;
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
      key: "textWithHtml",
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
      fields: ["textWithHtml"]
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
    const { textWithHtml, storeLocation, contextKey, inputKey } = config;

    function store(storeObject: any): void {
      if (storeLocation === "context") {
        api.addToContext(contextKey, storeObject, "simple");
      } else { // @ts-ignore
        api.addToInput(inputKey, storeObject);
      }
    }

    if (textWithHtml) {
      store(stripHtml(textWithHtml).result);
    }
  }
});
