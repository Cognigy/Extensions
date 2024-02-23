import { IConnectionSchema } from "@cognigy/extension-tools";

export const smsConnection: IConnectionSchema = {
  type: "sms8x8",
  label: "8x8 SMS",
  fields: [{ fieldName: "apiKey" }, { fieldName: "subAccountId" }],
};
