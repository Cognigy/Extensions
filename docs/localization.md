# Extension Localization

Creating Extensions is an important feature required to further extend Cognigy AI with additional functionality. As the UI supports several languages in the menus we also added a functionality to add translations to Extensions.

Localization is a completely optional feature that can be used whenever required. You don't need to enforce it consistently throughout an Extension, you can use it as well to translate just a single string.

## How does Localization work?

Localization supports the replacement of simple strings with a JSON object like this:

```json
{
	"default": "Default fallback string",
	"enUS": "String with English Localization",
	"deDE": "String with German Localization",
	"esES": "String with Spanish Localization",
	"koKR": "String with Korean Localization",
	"jaJP": "String with Japanese Localization"
}
```

The "default" property is mandatory and the other ones are optional, so you can e.g. choose to have an English and a German Localization only.

## Where is Localization visible?

Localization will be visible for every user of the Cognigy.AI User Interface (UI), therefore a Node with a German Localization will be displayed in German for every user that has their UI set to German.

End users won't see a difference when communicating with the localized Node.

## What can be localized?

Localization doesn't work for all properties. Right now these properties are supported in a Descriptor:

1. defaultLabel
2. summary

These properties are supported in a Node Section:

1. label

These properties are supported in a Node Field:

1. label
2. description

If a Node Field is of type "select" then it's also supported in the label property of the options in the params

## Localization Example

Let's take a sample Descriptor built without Localization:

    export const mySampleNode = createNodeDescriptor({
        type: "myExampleNode",
        defaultLabel: "My example Node",
        summary: "Just a simple example Node",
        fields: [
            {
                key: "textInput",
                label: "My Example Text Input"
                type: "cognigyText",
            },
            {
                key: "selectIcecream",
                label: "Do you like Icecream?"
                params: {
                    options: [
                        {
                            label: "Yes, I love Icecream!",
                            value: true
                        },
                        {
                            label: "No, I don't",
                            value: false
                        }
                    ]
                }
            }
        ],
        sections: [
            {
                key: "importantQuestions",
                label: "Important Questions",
                defaultCollapsed: true,
                fields: [
                    "selectIcecream"
                ]
            }
        ],
        form: [
            { type: "field", key: "textInput" },
            { type: "section", key: "importantQuestions" }
        ],
        function: async ({ cognigy, config }: IMySampleNode) => {
            // my Node logic
        }
    })

adding a German translation might look like this:

    export const mySampleNode = createNodeDescriptor({
        type: "myExampleNode",
        defaultLabel: {
            default: "My example Node",
            deDE: "Mein Beispiel Node"
        },
        summary: {
            default: "Just a simple example Node",
            deDE: "Nur ein einfaches Beispielnode"
        },
        fields: [
            {
                key: "textInput",
                label: {
                    default: "My Example Text Input",
                    deDE: "Mein Beispiel Text Eingabefeld"
                },
                type: "cognigyText",
            },
            {
                key: "selectIcecream",
                label: {
                    default: "Do you like Icecream?",
                    deDE: "Magst du Eiscreme?"
                },
                params: {
                    options: [
                        {
                            label: {
                                default: "Yes, I love Icecream!",
                                deDE: "Ja, ich liebe Eiscreme!"
                            },
                            value: true
                        },
                        {
                            label: {
                                default: "No, I don't",
                                deDE: "Nein, ich mag es nicht"
                            },
                            value: false
                        }
                    ]
                }
            }
        ],
        sections: [
            {
                key: "importantQuestions",
                label: {
                    default: "Important Questions",
                    deDE: "Wichtige Fragen"
                },
                defaultCollapsed: true,
                fields: [
                    "selectIcecream"
                ]
            }
        ],
        form: [
            { type: "field", key: "textInput" },
            { type: "section", key: "importantQuestions" }
        ],
        function: async ({ cognigy, config }: IMySampleNode) => {
            // my Node logic
        }
    })
