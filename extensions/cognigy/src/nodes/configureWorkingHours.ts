
import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

export interface IConfigureWorkingHoursParams extends INodeFunctionBaseParams {
    config: {
        odataBaseUrl: string;
        userId: string;
        sessionId: string;
        outputType: "json" | "html";
        tzOffset: string;
        storeLocation: "input" | "context";
        contextKey: string;
        inputKey: string;
    };
}

export const configureWorkingHoursNode = createNodeDescriptor({
    type: "configureWorkingHours",
    defaultLabel: "Set Working Hours",
    fields: [
        {
            key: "connection",
            label: "Cognigy API Connection",
            type: "connection",
            params: {
                connectionType: "cognigy-api",
                required: true
            }
        },
        {
            key: "odataBaseUrl",
            label: "OData Base URL",
            type: "cognigyText",
            defaultValue: "https://odata-trial.cognigy.ai",
        },
        {
            key: "userId",
            label: "Conversation User ID",
            type: "cognigyText",
            defaultValue: "{{ci.userId}}",
        },
        {
            key: "sessionId",
            label: "Conversation Session ID",
            type: "cognigyText",
            defaultValue: "{{ci.sessionId}}",
        },
        {
            key: "outputType",
            type: "select",
            label: "Output Type",
            defaultValue: "json",
            params: {
                options: [
                    {
                        label: "JSON",
                        value: "json"
                    },
                    {
                        label: "HTML",
                        value: "html"
                    }
                ],
                required: true
            },
        },
        {
            key: "tzOffset",
            type: "cognigyText",
            label: "User Timezone Offset",
            defaultValue: "-6",
            condition: {
                key: "outputType",
                value: "html",
            }
        },

        {
            key: "storeLocation",
            type: "select",
            label: "Where to store the result",
            defaultValue: "input",
            params: {
                options: [
                    {
                        label: "Input",
                        value: "input"
                    },
                    {
                        label: "Context",
                        value: "context"
                    }
                ],
                required: true
            },
        },
        {
            key: "inputKey",
            type: "cognigyText",
            label: "Input Key to store Result",
            defaultValue: "conversation",
            condition: {
                key: "storeLocation",
                value: "input",
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: "Context Key to store Result",
            defaultValue: "conversation",
            condition: {
                key: "storeLocation",
                value: "context",
            }
        },

    ],
    sections: [
        {
            key: "advanced",
            label: "Advanced",
            defaultCollapsed: true,
            fields: [
                "outputType",
                "tzOffset"
            ]
        },
        {
            key: "storage",
            label: "Storage Option",
            defaultCollapsed: true,
            fields: [
                "storeLocation",
                "inputKey",
                "contextKey",
            ]
        }
    ],
    form: [
        { type: "field", key: "connection" },
        { type: "field", key: "odataBaseUrl" },
        { type: "field", key: "userId" },
        { type: "field", key: "sessionId" },
        { type: "section", key: "advanced" },
        { type: "section", key: "storage" },
    ],
    // function: getConversationFunction
    function: async ({ cognigy, config }: IConfigureWorkingHoursParams): Promise<any> => {
        const { api, context, input } = cognigy;
        const { odataBaseUrl, userId, sessionId, outputType, tzOffset, storeLocation, inputKey, contextKey } = config;

        // if it is Christmas or New Years in EST, set openHours to closed

        function isChristmasOrNewYearsDay() {
            var currentTime = new Date();
            var offset = -4.0;
            var estTime = new Date(currentTime.getTime() + offset * 3600 * 1000);
            var month = estTime.getUTCMonth();
            var day = estTime.getUTCDate();

            if ((month === 11 && day === 25) || (month === 0 && day === 1)) {
                return true;
            } else {
                return false;
            }
        }

        // set the holiday value to a variable for testing
        let holidayTest = isChristmasOrNewYearsDay()
        if (holidayTest === true) {
            // context.handoverOpen = false
            api.addToContext('handoverOpen', false, 'simple');
        }
        else {
            // test the current EST hour within the scope of the set hours for Sunday (if Sunday), then the rest of the week
            function isESTBusinessHour() {
                var currentTime = new Date();
                var offset = -4.0;
                var estTime = new Date(currentTime.getTime() + offset * 3600 * 1000);
                var dayOfWeek = estTime.getUTCDay();
                var hour = estTime.getUTCHours();

                // Set the working hours
                if (dayOfWeek === 0) {
                    return (hour >= 12 && hour <= 19);
                } else {
                    return (hour >= 9 && hour <= 20);
                }
            }

            // set the boolean value for the hours
            api.addToContext('handoverOpen', isESTBusinessHour(), 'simples');
            // context.handoverOpen = isESTBusinessHour();
        }

    }
});