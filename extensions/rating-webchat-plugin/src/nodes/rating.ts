import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

export interface IRatingCardParams extends INodeFunctionBaseParams {
	config: {
		title: string;
		initialRating: number;
		maxRatingValue: number;
		precision: number;
		variant: string;
		size: string;
		rateButtonText: string;
	};
}
/*
api.say('', {
  "_plugin": {
    "type": "rating",
    "title": "How did it go? Please rate us",
    "initialRating": 0,
    "size": "large", // 'small', 'medium', 'large'
    "variant": "star", // 'star', 'heart', 'emoji'
    "maxRatingValue": 5,
    "precision": 0.5, // '1' or '0.5' for rating values like 3.5
    "rateButtonText": "Send Rating"
  }
});
    "initialRating": 2,
    "size": "medium", // 'small', 'medium', 'large'
    "variant": "star", // 'star', 'heart', 'emoji'
    "maxRatingValue": 5,
    "precision": 1, // '1' or '0.5' for rating values like 3.5
    "rateButtonText": "Send Rating"
*/

export const rating = createNodeDescriptor({
	type: "ratingCard",
	defaultLabel: "Rate",
	fields: [
		{
			key: "title",
			label: "Title",
			type: "cognigyText",
			defaultValue: "Please rate us",
			params: {
				required: true
			}
		},
		{
			key: "initialRating",
			label: "Initial Rating",
			type: "slider",
			params: {
				min: 0,
				max: 5,
				step: 1
			}
		},
		{
			key: "maxRatingValue",
			label: "Maximal Rating",
			type: "slider",
			defaultValue: 5,
			params: {
				min: 0,
				max: 5,
				step: 1,
				required: true
			}
		},
		{
			key: "precision",
			label: "Precision",
			type: "slider",
			defaultValue: "1",
			params: {
				min: 0.5,
				max: 1,
				step: 0.5,
				required: true
			}
		},
		{
			key: "size",
			label: "Size",
			type: "select",
			defaultValue: "medium",
			params: {
				options: [
					{ value: "small", label: "Small"},
					{ value: "medium", label: "Medium"},
					{ value: "large", label: "Large"}
				]
			}
		},
		{
			key: "variant",
			label: "Variant",
			type: "select",
			defaultValue: "star",
			params: {
				options: [
					{ value: "star", label: "Star"},
					{ value: "heart", label: "Heart"},
					{ value: "emoji", label: "Emoji"}
				]
			}
		},
		{
			key: "rateButtonText",
			label: "Rate Button Text",
			type: "cognigyText",
			defaultValue: "Send Rating",
			params: {
				required: true
			}
		}
	],
	preview: {
		type: "text",
		key: "text"
	},
	function: async ({ cognigy, config }: IRatingCardParams) => {
		const { api } = cognigy;
		// const { title } = config;
		api.say('', {
			"_plugin": {
				"type": "rating",
				"title": config.title,
				"initialRating": config.initialRating,
				"size": config.size,
				"variant": config.variant,
				"maxRatingValue": config.maxRatingValue,
				"precision": config.precision,
				"rateButtonText": config.rateButtonText
			}
		});
	}
});
