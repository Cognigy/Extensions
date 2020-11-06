import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

export interface IRequestParams extends INodeFunctionBaseParams {
	config: {
		playUrlUrl: string;
        playUrlMediaFormat: string;
        playUrlAltText: string;
        playUrlCaching: boolean;
	};
}

export const playURLNode = createNodeDescriptor({
	type: "playURL",
	defaultLabel: "Play URL",
	fields: [
		{
			key: "playUrlUrl",
			label: "Media URL",
            type: "cognigyText",
            params: {
                required: true
            }
		},
		{
			key: "playUrlMediaFormat",
			label: "Media Format",
			type: "select",
			defaultValue: "wav/lpcm16",
			params: {
				options: [
					{
						label: "wav/lpcm16",
						value: "wav/lpcm16"
					},
					{
						label: "raw/lpcm16",
						value: "raw/lpcm16"
					}
				]
			}
        },
        {
			key: "playUrlAltText",
			label: "Alt Text",
            type: "cognigyText",
            description: "Defines the text to display in the transcript page of the user interface while the audio is played",
            defaultValue: ""
        },
        {
			key: "playUrlCaching",
			label: "Cache Audio",
            type: "toggle",
            defaultValue: false
        }
	],
	preview: {
		type: "text",
		key: "playUrlUrl"
	},
	appearance: {
		color: "#F5A623"
	},

	function: async ({ cognigy, config }: IRequestParams) => {
		const { api } = cognigy;
		const { playUrlUrl, playUrlMediaFormat, playUrlAltText } = config;

		if (playUrlUrl && playUrlMediaFormat) {
			let activityParams = {
				playUrlUrl,
				playUrlMediaFormat
			};

			if (playUrlAltText) activityParams["playUrlAltText"] = playUrlAltText;

			api.output(null, {
				"_cognigy": {
					"_audioCodes": {
						"json": {
							"activities": [
								{
									"type": "event",
									"name": "playUrl",
									activityParams
								}
							]
						}
					}
				}
			});
		}
	}
});