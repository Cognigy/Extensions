import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

export interface ILocaleParams extends INodeFunctionBaseParams {
	config: {
		language: string;
		voice: string;
	};
}

export const localeNode = createNodeDescriptor({
    type: "locale",
	defaultLabel: "Locale",
	fields: [ {
				key: "language",
				label: "Language",
				type: "select",
				defaultValue: "en-US",
				params: {
					options: [
						{
							label: "English (United States)",
							value: "en-US"
						},
						{
							label: "Spanish (United States)",
							value: "es-US"
						},
						{
							label: "Spanish (Spain)",
							value: "es-ES"
						},
						{
							label: "French (France)",
							value: "fr-FR"
						},
						{
							label: "Portuguese (Portugal)",
							value: "pt-PT"
						}
					]
				}
			},
			{
				key: "voice",
				label: "Voice",
				type: "select",
				defaultValue: "woman",
				params: {
					options: [
						{
							label: "Woman",
							value: "woman"
						},
						{
							label: "Man",
							value: "man"
						}
					]
				}
			},
		],
    form: [{
            type: "field",
            key: "language"
        }, {
            type: "field",
            key: "voice"
        }
    ],
    function: async({ cognigy, config } : ILocaleParams) => {
        const { api } = cognigy;
		const { language, voice } = config;

        api.output('', {
			"_cognigy": {
				"_spoken": {
					"json": {
						"activities": [{
								"type": "event",
								"name": "locale",
								"activityParams": {
									language,
									voice
								}
							}
						]
					}
				}
			}
		});
    }
});
