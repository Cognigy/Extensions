import { IConnectionSchema } from "@cognigy/extension-tools";

export const abbyyConnection: IConnectionSchema = {
    type: "abbyy-instance",
    label: "Abbyy Instance",
    fields: [
        { fieldName: "instanceUri" }
    ]
};