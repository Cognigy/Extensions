import { createNodeDescriptor } from "@cognigy/extension-tools";
import { ISendSMSParams } from "./types";

export const onSuccessSMS = createNodeDescriptor({
  type: "onSuccessSMS",
  parentType: "sendSMS",
  defaultLabel: "On Success",
  constraints: {
    editable: false,
    deletable: false,
    creatable: false,
    movable: false,
    placement: {
      predecessor: {
        whitelist: [],
      },
    },
  },
  appearance: {
    color: "#61d188",
    textColor: "white",
    variant: "mini",
  },
});

export const onErrorSMS = createNodeDescriptor({
  type: "onErrorSMS",
  parentType: "sendSMS",
  defaultLabel: "On Error",
  constraints: {
    editable: false,
    deletable: false,
    creatable: false,
    movable: false,
    placement: {
      predecessor: {
        whitelist: [],
      },
    },
  },
  appearance: {
    color: "#cf142b",
    textColor: "white",
    variant: "mini",
  },
});

export const sendSMSNode = createNodeDescriptor({
  type: "sendSMS",
  defaultLabel: "Send SMS",
  summary: "Send SMS individually (1 request per SMS)",
  fields: [
    {
      key: "connection",
      label: "8x8 SMS Connection",
      type: "connection",
      params: {
        connectionType: "sms8x8",
        required: true,
      },
    },
    {
      key: "destination",
      label: "Destination",
      type: "text",
      description:
        "MSISDN (destination mobile phone number). We accept both international and national formats (for national you have to specify country in the dedicated field).",
      params: {
        required: true,
        placeholder: "6500000000",
      },
    },
    {
      key: "text",
      label: "Text",
      type: "text",
      description: "Message body - the text of the message",
      params: {
        required: true,
        placeholder: "Hello world!",
      },
    },
    {
      key: "source",
      label: "Source",
      type: "text",
      description: 'Source number (SenderId) - "From:" field for the SMS',
      params: {
        required: false,
        placeholder: "AwesomeName",
      },
    },
    {
      key: "country",
      label: "Country",
      type: "cognigyText",
      description:
        "Optional country code of Destination number(ISO 3166-1 alpha-2), if you know it. It will help to convert number from national to international format",
      params: {
        required: false,
      },
    },
    {
      key: "clientMessageId",
      label: "Client Message Id",
      type: "text",
      description:
        "Client managed id for the message : your own unique reference",
      params: {
        required: false,
        placeholder: "1234",
      },
    },
    {
      key: "encoding",
      label: "Encoding",
      type: "select",
      description: "Encoding for the text of the message",
      defaultValue: "AUTO",
      params: {
        options: [
          {
            label: "AUTO",
            value: "AUTO",
          },
          {
            label: "GSM7",
            value: "GSM7",
          },
          {
            label: "UCS2",
            value: "UCS2",
          },
        ],
        required: false,
      },
    },
    {
      key: "scheduled",
      label: "Scheduled",
      type: "datetime",
      description:
        "Date and time when a schedule delivery of the message must happen",
      params: {
        required: false,
      },
    },
    {
      key: "expiry",
      label: "Expiry",
      type: "datetime",
      description: "Date and time after which a message cannot be sent",
      params: {
        required: false,
      },
    },
    {
      key: "dlrCallbackUrl",
      label: "DLR Callback Url",
      type: "cognigyText",
      description:
        "Webhook URL where delivery status for the SMS will be posted (Overwrites your default account callback URL).",
      params: {
        required: false,
      },
    },
    {
      key: "clientIp",
      label: "Client IP",
      type: "cognigyText",
      description:
        "Fill this field to limit the number of SMS sent within a period of time based on IP address.",
      params: {
        required: false,
      },
    },
    {
      key: "track",
      label: "Track",
      type: "cognigyText",
      description:
        "Indicate whether use the sent SMS for tracking conversion rate. Use Outcome for tracking and None for no tracking.",
      params: {
        required: false,
      },
    },
    {
      key: "storeLocation",
      type: "select",
      label: "Where to store the result",
      params: {
        options: [
          {
            label: "Input",
            value: "input",
          },
          {
            label: "Context",
            value: "context",
          },
        ],
        required: true,
      },
      defaultValue: "context",
    },
    {
      key: "inputKey",
      type: "cognigyText",
      label: "Input Key to store Result",
      defaultValue: "sms8x8",
      condition: {
        key: "storeLocation",
        value: "input",
      },
    },
    {
      key: "contextKey",
      type: "cognigyText",
      label: "Context Key to store Result",
      defaultValue: "sms8x8",
      condition: {
        key: "storeLocation",
        value: "context",
      },
    },
  ],
  sections: [
    {
      key: "optional",
      label: "Optional",
      defaultCollapsed: true,
      fields: [
        "source",
        "country",
        "clientMessageId",
        "encoding",
        "scheduled",
        "expiry",
        "dlrCallbackUrl",
        "clientIp",
        "track",
      ],
    },
    {
      key: "storageOption",
      label: "Storage Option",
      defaultCollapsed: true,
      fields: ["storeLocation", "inputKey", "contextKey"],
    },
  ],
  form: [
    { type: "field", key: "connection" },
    { type: "field", key: "destination" },
    { type: "field", key: "text" },
    { type: "section", key: "optional" },
    { type: "section", key: "storageOption" },
  ],
  dependencies: {
    children: [onSuccessSMS.type, onErrorSMS.type],
  },
  function: async ({ cognigy, config, childConfigs }: ISendSMSParams) => {
    const { api } = cognigy;
    const {
      connection,
      destination,
      text,
      source,
      country,
      encoding,
      clientMessageId,
      scheduled,
      expiry,
      dlrCallbackUrl,
      clientIp,
      track,
      storeLocation,
      inputKey,
      contextKey,
    } = config;
    const { apiKey, subAccountId } = connection;

    try {
      const response = await fetch(
        `https://sms.8x8.com/api/v1/subaccounts/${subAccountId}/messages`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            "X-Marketplace": "Cognigy",
          },
          body: JSON.stringify({
            destination,
            text,
            encoding,
            source,
            country: country ? country : null,
            clientMessageId,
            scheduled,
            expiry,
            dlrCallbackUrl,
            clientIp,
            track,
          }),
        }
      );
      const jsonResponse = await response.json();

      if (response.status >= 400) {
        throw jsonResponse;
      }

      const onSuccessChild = childConfigs.find(
        (child) => child.type === "onSuccessSMS"
      );
      api.setNextNode?.(onSuccessChild!.id);

      if (storeLocation === "context") {
        api.addToContext?.(contextKey, jsonResponse, "simple");
      } else {
        // @ts-ignore
        api.addToInput(inputKey, jsonResponse);
      }
    } catch (error) {
      const onErrorChild = childConfigs.find(
        (child) => child.type === "onErrorSMS"
      );
      api.setNextNode?.(onErrorChild!.id);

      if (storeLocation === "context") {
        api.addToContext?.(contextKey, error, "simple");
      } else {
        // @ts-ignore
        api.addToInput(inputKey, error);
      }
    }
  },
});
