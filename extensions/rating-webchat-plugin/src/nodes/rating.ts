import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

export interface IRatingCardParams extends INodeFunctionBaseParams {
  config: {
    initialRating: number;
    title: string;
    maxRatingValueHeart: number;
    maxRatingValueStar: number;
    precisionHeart: number;
    precisionStar: number;
    variant: string;
    size: string;
    rateButtonText: string;
    label: string;
    payload: string;
  };
}

export const rating = createNodeDescriptor({
  type: "ratingCard",
  defaultLabel: "Show Rating Card",
  fields: [
    {
      key: "title",
      type: "cognigyText",
      label: "Rating card title",
      defaultValue: "Please give us your rating",
      params: { required: true }
    },
    {
      key: "variant",
      type: "select",
      label: "Variant",
      defaultValue: "star",
      params: {
        options: [
          { value: "star", label: "Star" },
          { value: "heart", label: "Heart" },
          { value: "emoji", label: "Emoji" }
        ]
      }
    },
    {
      key: "initialRating",
      label: "Initial rating when card shows up",
      type: "slider",
      params: { min: 0, max: 10, step: 1 }
    },
    { // TODO: remove these duplicates when advanced conditions are available
      key: "maxRatingValueStar",
      label: "Maximal Rating",
      type: "slider",
      defaultValue: 5,
      params: { min: 2, max: 10, step: 1 },
      condition: { key: "variant", value: "star" }
    },
    { // TODO: remove these duplicates when advanced conditions are available
      key: "maxRatingValueHeart",
      label: "Maximal Rating",
      type: "slider",
      defaultValue: 5,
      params: { min: 2, max: 10, step: 1 },
      condition: { key: "variant", value: "heart" }
    },
    { // TODO: remove these duplicates when advanced conditions are available
      key: "precisionStar",
      label: "Rating precision",
      type: "slider",
      defaultValue: "1",
      params: { min: 0.5, max: 1, step: 0.5 },
      condition: { key: "variant", value: "star" }
    },
    { // TODO: remove these duplicates when advanced conditions are available
      key: "precisionHeart",
      label: "Rating precision",
      type: "slider",
      defaultValue: "1",
      params: { min: 0.5, max: 1, step: 0.5 },
      condition: { key: "variant", value: "heart" }
    },
    {
      key: "size",
      label: "Size of rating icons",
      type: "select",
      defaultValue: "medium",
      params: {
        options: [
          { value: "small", label: "Small" },
          { value: "medium", label: "Medium" },
          { value: "large", label: "Large" }
        ]
      }
    },
    {
      key: "rateButtonText",
      label: "Text on button that submits rating",
      type: "cognigyText",
      defaultValue: "Submit Rating",
      params: { required: true }
    },
    {
      key: "label",
      label: "Message bubble from user after rating submitted",
      type: "cognigyText"
    },
    {
      key: "payload",
      label: "Text after rating value in user message",
      type: "cognigyText"
    }
  ],
  preview: { type: "text", key: "text" },
  function: async ({ cognigy, config }: IRatingCardParams) => {
    const { api } = cognigy;
    const {
      title,
      initialRating,
      maxRatingValueHeart,
      maxRatingValueStar,
      precisionHeart,
      precisionStar,
      variant,
      size,
      rateButtonText,
      label,
      payload
    } = config;

    // TODO: refactor this when advanced conditions are available
    let maxRatingValue = 5;
    let precision = 1;
    switch (variant) {
      case 'star': {
        maxRatingValue = maxRatingValueStar;
        precision = precisionStar;
        break;
      }
      case 'heart': {
        maxRatingValue = maxRatingValueHeart;
        precision = precisionHeart;
        break;
      }
    }

    api.say('', {
      '_plugin': {
        type: 'rating',
        title: title,  // "Please rate your experience"
        initialRating: initialRating, // 0, 1, 2, ...
        size: size,  // "small", "medium", "large"
        variant: variant,  // "star", "heart", "emoji"
        maxRatingValue: maxRatingValue, // 2, 3, 4, ...
        precision: precision, // 0.5, 1
        rateButtonText: rateButtonText, // "Submit Rating"
        label: label || '',  // Here is my rating"
        payload: payload || ''  // "stars"
      }
    });
  }
});
