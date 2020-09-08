import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

export interface IRequestParams extends INodeFunctionBaseParams {
	config: {
		playUrl: string;
		playUrlMediaFormat: string;
	}
}

export const playURLNode = createNodeDescriptor({
	type: "playURL",
	defaultLabel: "Play URL",
	fields: [
		{
			key: "playUrl",
			label: "Media URL",
			type: "cognigyText"
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
		}
	],
	preview: {
		type: "text",
		key: "playUrl"
	},
	appearance: {
		color: "#30A4DC"
	},

	function: async ({ cognigy, config }: IRequestParams) => {
		const { api } = cognigy;
		const { playUrl, playUrlMediaFormat } = config;

		if (playUrl && playUrlMediaFormat)
			api.output(null, {
				"_cognigy": {
					"_audiocodes": {
						"activities": [
							{
								"type": "event",
								"name": "playUrl",
								"activityParams": {
								"playUrlUrl": playUrl,
								"playUrlMediaFormat": playUrlMediaFormat
								}
							}					  
						]
					}
				}
			});

	}
});