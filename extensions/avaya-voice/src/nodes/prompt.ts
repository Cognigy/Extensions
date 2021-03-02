import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

export interface IPromptParams extends INodeFunctionBaseParams {
	config: {
        promptType: string;
        menuText: string;
		menuItem: string[];
        numberText: string;
        numberOfDigits: number;
	};
}

export const promptNode = createNodeDescriptor({
    type: "prompt",
    defaultLabel: "Prompt",
    fields: [
        {
            key: "promptType",
            label: "Type",
            type: "select",
            defaultValue: "menu",
            params: {
                options: [
                    {
                        label: "Menu",
                        value: "menu"
                    },
                    {
                        label: "Number",
                        value: "number"
                    }
                ]
            }
        },
        {
            key: "menuText",
            label: "Text",
            type: "cognigyText",
            defaultValue: "Press 1 for Intent1, 2 for Intent2",
            params: {
                required: false
            },
            condition: {
                key: "promptType",
                value: "menu",
            }
        },
        {
            key: "menuItem",
            label: "Menu ( *format 1:intent1 ...)",
            type: "textArray",
            defaultValue: [
                "1:intent1",
                "2:intent2"
            ],
            condition: {
                key: "promptType",
                value: "menu",
            }
        },
        {
            key: "numberText",
            label: "Text",
            type: "cognigyText",
            defaultValue: "Please enter your account number",
            params: {
                required: false
            },
            condition: {
                key: "promptType",
                value: "number",
            }
        },
        {
            key: "numberOfDigits",
            label: "Max number of digits",
            type: "number",
            defaultValue: "16",
            params: {
                required: true
            },
            condition: {
                key: "promptType",
                value: "number",
            }
        },
    ],
    form: [{
            type: "field",
            key: "promptType"
        }, {
            type: "field",
            key: "menuText"
        }, {
            type: "field",
            key: "menuItem"
        }, {
            type: "field",
            key: "numberText"
        }, {
            type: "field",
            key: "numberOfDigits"
        }
    ],
    function: async({ cognigy, config }: IPromptParams) => {
        const { api } = cognigy;
        const { promptType, menuText, menuItem, numberText, numberOfDigits } = config;
        let menu: any = {};

        if (promptType === "menu") {
            if (!menuItem) throw new Error('The menu is missing.');
        }
        if (promptType === "number") {
            if (!numberOfDigits) throw new Error("The number of digits is missing");
        }

        for (const item of menuItem) {
            let numberIndex = item.indexOf(":");
            let id = item.slice(0, numberIndex);
            id = id.split(' ').join('');

            let value = item.slice(numberIndex + 1);
            value = value.trim();

            if (numberIndex < 0) {
                throw new Error('The menu syntax is not correct.');
            } else {
                menu[id] = value;
            }
        }

        api.output('', {
			"_cognigy": {
				"_spoken": {
					"json": {
						"activities": [{
								"type": "event",
								"name": "prompt",
								"activityParams": {
                                    promptType,
                                    menuText,
                                    menu,
                                    numberText,
                                    numberOfDigits
								}
							}
						]
					}
				}
			}
		});
    }
});
