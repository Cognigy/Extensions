import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

export interface IHangupParams extends INodeFunctionBaseParams {
    config: {
        option: string;
        phoneNumber: string;
    };
}
export const transferNode = createNodeDescriptor({
    type: "transfer",
    defaultLabel: {
        default: "Transfer",
        deDE: "Weiterleiten"
    },
    summary: {
        default: "Leitet ein Telefonat ",
        deDE: "Beendet ein aktuell laufendes Telefonat in Amazon Connect und legt auf"
    },
    appearance: {
        color: "#008995"
    },
    fields: [
        {
            key: "option",
            label: "Option",
            type: "select",
            description: "Where to transfer the user to",
            defaultValue: "queue",
            params: {
                required: true,
                options: [
                    {
                        label: "Queue",
                        value: "queue"
                    },
                    {
                        label: "Phone Number",
                        value: "phoneNumber"
                    },
                ]
            }
        },
        {
            key: "phoneNumber",
            label: "Phone Number",
            type: "cognigyText",
            defaultValue: "+4915112345678",
            condition: {
                key: "option",
                value: "phoneNumber"
            }
        },
    ],
    form: [
        { type: "field", key: "option" },
        { type: "field", key: "phoneNumber" },
    ],
    function: async ({ cognigy, config }: IHangupParams) => {
        const { api } = cognigy;
        const { option, phoneNumber } = config;

        if (option === "phoneNumber") {
            api.say("", {
                "connect_action": "TRANSFER_PHONENUMBER",
                "connect_action_data": phoneNumber
            });
        } else {
            api.say("", {
                "connect_action": "TRANSFER",
                "connect_action_data": ""
            });
        }
    }
});