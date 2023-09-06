import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
const { SyncRedactor } = require('redact-pii');

export interface IRedactParams extends INodeFunctionBaseParams {
    config: {
        text: string;
        globalReplaceWith: string;
        credentials: boolean;
        creditCardNumber: boolean;
        emailAddress: boolean;
        ipAddress: boolean;
        names: boolean;
        password: boolean;
        phoneNumber: boolean;
        streetAddress: boolean;
        username: boolean;
        usSocialSecurityNumber: boolean;
        zipcode: boolean;
        url: boolean;
        digits: boolean;
        addCustomPatterns: boolean;
        customPatterns: any;
        storeLocation: string;
        contextKey: string;
        inputKey: string;
    };
}
export const redactNode = createNodeDescriptor({
    type: "redact",
    defaultLabel: {
        default: "Redact",
    },
    summary: {
        default: "Removes personally identifiable information from text"
    },
    fields: [
        {
            key: "text",
            label: {
                default: "Text",
            },
            type: "cognigyText",
            defaultValue: "{{input.text}}",
            params: {
                required: true
            }
        },
        {
            key: "globalReplaceWith",
            label: {
                default: "Replace with",
            },
            type: "cognigyText",
            defaultValue: "***",
            params: {
                required: true
            }
        },
        {
            key: "credentials",
            label: {
                default: "Credentials",
            },
            type: "toggle",
            defaultValue: true,
            params: {
                required: true
            }
        },
        {
            key: "creditCardNumber",
            label: {
                default: "Credit Card Number",
            },
            type: "toggle",
            defaultValue: true,
            params: {
                required: true
            }
        },
        {
            key: "emailAddress",
            label: {
                default: "Email Address",
            },
            type: "toggle",
            defaultValue: true,
            params: {
                required: true
            }
        },
        {
            key: "ipAddress",
            label: {
                default: "IP Address",
            },
            type: "toggle",
            defaultValue: true,
            params: {
                required: true
            }
        },
        {
            key: "names",
            label: {
                default: "Names",
            },
            type: "toggle",
            defaultValue: true,
            params: {
                required: true
            }
        },
        {
            key: "password",
            label: {
                default: "Password",
            },
            type: "toggle",
            defaultValue: true,
            params: {
                required: true
            }
        },
        {
            key: "phoneNumber",
            label: {
                default: "Phone Number",
            },
            type: "toggle",
            defaultValue: true,
            params: {
                required: true
            }
        },
        {
            key: "streetAddress",
            label: {
                default: "Street Address",
            },
            type: "toggle",
            defaultValue: true,
            params: {
                required: true
            }
        },
        {
            key: "username",
            label: {
                default: "Username",
            },
            type: "toggle",
            defaultValue: true,
            params: {
                required: true
            }
        },
        {
            key: "usSocialSecurityNumber",
            label: {
                default: "US Social Security Number",
            },
            type: "toggle",
            defaultValue: true,
            params: {
                required: true
            }
        },
        {
            key: "zipcode",
            label: {
                default: "Zip Code",
            },
            type: "toggle",
            defaultValue: true,
            params: {
                required: true
            }
        },
        {
            key: "url",
            label: {
                default: "URL",
            },
            type: "toggle",
            defaultValue: true,
            params: {
                required: true
            }
        },
        {
            key: "digits",
            label: {
                default: "Digits",
            },
            type: "toggle",
            defaultValue: true,
            params: {
                required: true
            }
        },
        {
            key: "addCustomPatterns",
            label: {
                default: "Add Custom Patterns",
            },
            type: "toggle",
            defaultValue: false,
            params: {
                required: true
            }
        },
        {
            key: "customPatterns",
            label: {
                default: "Custom Patterns",
            },
            type: "typescript",
            defaultValue: `[
    {
        "regexpPattern": /\b(cat|dog|cow)s?\b/gi,
        "replaceWith": "ANIMAL"
    }
]`,
            params: {
                required: true
            },
            condition: {
                key: "addCustomPatterns",
                value: true
            }
        },
        {
            key: "storeLocation",
            type: "select",
            label: {
                default: "Where to store the result"
            },
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
            label: {
                default: "Input Key to store Result"
            },
            defaultValue: "text",
            condition: {
                key: "storeLocation",
                value: "input",
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: {
                default: "Context Key to store Result"
            },
            defaultValue: "text",
            condition: {
                key: "storeLocation",
                value: "context",
            }
        },
    ],
    sections: [
        {
            key: "storage",
            label: {
                default: "Storage Option",
                deDE: "Speicheroption",
            },
            defaultCollapsed: true,
            fields: [
                "storeLocation",
                "inputKey",
                "contextKey",
            ]
        },
        {
            key: "advanced",
            label: {
                default: "Advanced",
                deDE: "Erweitert",
            },
            defaultCollapsed: true,
            fields: [
                "globalReplaceWith",
                "credentials",
                "creditCardNumber",
                "emailAddress",
                "ipAddress",
                "names",
                "password",
                "phoneNumber",
                "streetAddress",
                "username",
                "usSocialSecurityNumber",
                "zipcode",
                "url",
                "digits",
                "addCustomPatterns",
                "customPatterns"
            ]
        }
    ],
    form: [
        { type: "field", key: "text" },
        { type: "section", key: "advanced" },
        { type: "section", key: "storage" },
    ],
    function: async ({ cognigy, config }: IRedactParams) => {
        const { api } = cognigy;
        const { text,
            globalReplaceWith,
            credentials,
            creditCardNumber,
            emailAddress,
            ipAddress,
            names,
            password,
            phoneNumber,
            streetAddress,
            username,
            usSocialSecurityNumber,
            zipcode,
            url,
            digits,
            customPatterns,
            storeLocation,
            contextKey,
            inputKey
        } = config;

        try {

            const redactor = new SyncRedactor({
                // customRedactors: {
                //     before: customPatterns
                // },
                globalReplaceWith,
                builtInRedactors: {
                    credentials: {
                        enabled: credentials
                    },
                    creditCardNumber: {
                        enabled: creditCardNumber
                    },
                    ipAddress: {
                        enabled: ipAddress
                    },
                    password: {
                        enabled: password
                    },
                    emailAddress: {
                        enabled: emailAddress
                    },
                    phoneNumber: {
                        enabled: phoneNumber
                    },
                    names: {
                        enabled: names
                    },
                    streetAddress: {
                        enabled: streetAddress
                    },
                    username: {
                        enabled: username
                    }
                    , usSocialSecurityNumber: {
                        enabled: usSocialSecurityNumber
                    },
                    zipcode: {
                        enabled: zipcode
                    },
                    url: {
                        enabled: url
                    },
                    digits: {
                        enabled: digits
                    }
                }
            });

            const redactedText = redactor.redact(text);

            if (storeLocation === "context") {
                api.addToContext(contextKey, redactedText, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, redactedText);
            }

        } catch (error) {

            if (storeLocation === "context") {
                api.addToContext(contextKey, { error: error }, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, { error: error });
            }
        }

    }
});