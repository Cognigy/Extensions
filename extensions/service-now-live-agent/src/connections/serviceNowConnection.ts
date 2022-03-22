import { IConnectionSchema } from "@cognigy/extension-tools/build";

export const serviceNowConnection: IConnectionSchema = {
    type: "serviceNowConnection",
    label: "ServiceNow Virtual Agent API Details",
    fields: [
        { fieldName: "serviceNowInstanceURL" },
        { fieldName: "serviceNowAPIToken" },
        { fieldName: "serviceNowUserName" },
        { fieldName: "serviceNowPassword" },
    ]
};