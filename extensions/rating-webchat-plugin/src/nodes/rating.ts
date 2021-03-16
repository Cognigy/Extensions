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

export const ratingCardNode = createNodeDescriptor({
  type: "ratingCard",
  defaultLabel: "Show Rating Card",
  fields: [
    {
      key: "title",
      type: "cognigyText",
      label: "Title",
      description: "Rating card title",
      defaultValue: "Please give us your rating",
      params: { required: true }
    },
    {
      key: "variant",
      type: "select",
      label: "Variant",
      description: "Which rating icons are shown to the user",
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
      label: "Initial Rating",
      description: "Initial rating value when the card shows up",
      type: "slider",
      params: { min: 0, max: 10, step: 1 }
    },
    {
      key: "maxRatingValueStar",
      label: "Maximal Rating",
      description: "Maximal rating value",
      type: "slider",
      defaultValue: 5,
      params: { min: 2, max: 10, step: 1 },
      condition: { key: "variant", value: "star" }
    },
    {
      key: "maxRatingValueHeart",
      label: "Maximal Rating",
      description: "Maximal rating value",
      type: "slider",
      defaultValue: 5,
      params: { min: 2, max: 10, step: 1 },
      condition: { key: "variant", value: "heart" }
    },
    {
      key: "precisionStar",
      label: "Rating Precision",
      description: "How granular could the rating value be (full icon or half)",
      type: "slider",
      defaultValue: "1",
      params: { min: 0.5, max: 1, step: 0.5 },
      condition: { key: "variant", value: "star" }
    },
    {
      key: "precisionHeart",
      label: "Rating precision",
      description: "How granular could the rating value be (full icon or half)",
      type: "slider",
      defaultValue: "1",
      params: { min: 0.5, max: 1, step: 0.5 },
      condition: { key: "variant", value: "heart" }
    },
    {
      key: "size",
      label: "Icon Size",
      description: "Size of the rating icons",
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
      label: "Submit Button Text",
      description: "Text on the button that submits the rating",
      type: "cognigyText",
      defaultValue: "Submit Rating",
      params: { required: true }
    },
    {
      key: "label",
      label: "Rating Message",
      description: "Message bubble from user after the rating submitted",
      type: "cognigyText"
    },
    {
      key: "payload",
      label: "Text After Rating Value",
      description: "Text after the rating value in the message that is sent from the user to the bot when the rating is submitted",
      type: "cognigyText"
    }
  ],
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

    let maxRatingValue = 5; // Default when variant = "emoji"
    let precision = 1; // Default when variant = "emoji"
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
