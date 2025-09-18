import type { IIntent } from "./intent";

interface IList {
	title: string;
	subtitle: string;
	imageUrl: string;
	defaultActionUrl: string;
	buttons: any[];
}

export function createPlainText(input: any, intents: IIntent[]): string {
	const plainText = [];

	// Add the main intent at the first position of the quick reply array

	// Always add the first found intent as second quick reply
	plainText.push(intents[0].disambiguationSentence);

	switch (intents.length) {
		case 1:
			break;
		case 2:
			plainText.push(intents[1].disambiguationSentence);
			break;
		default:
			plainText.push(intents[1].disambiguationSentence);
			plainText.push(intents[2].disambiguationSentence);
	}

	return plainText.join(", ").replace(/,([^,]*)$/, " or $1");
}

export function createList(input: any, intents: IIntent[]): IList[] {
	const list: IList[] = [];

	// Add the main intent at the first position of the quick reply array
	list.push({
		title: input.nlu.intentMapperResults.finalIntentDisambiguationSentence,
		subtitle: "",
		imageUrl: "",
		defaultActionUrl: "",
		buttons: [],
	});

	// Always add the first found intent as second quick reply
	list.push({
		title: intents[0].disambiguationSentence,
		subtitle: "",
		imageUrl: "",
		defaultActionUrl: "",
		buttons: [],
	});

	switch (intents.length) {
		case 1:
			break;
		case 2:
			list.push({
				title: intents[1].disambiguationSentence,
				subtitle: "",
				imageUrl: "",
				defaultActionUrl: "",
				buttons: [],
			});
			break;
		default:
			list.push({
				title: intents[1].disambiguationSentence,
				subtitle: "",
				imageUrl: "",
				defaultActionUrl: "",
				buttons: [],
			});
			list.push({
				title: intents[2].disambiguationSentence,
				subtitle: "",
				imageUrl: "",
				defaultActionUrl: "",
				buttons: [],
			});
	}

	return list;
}
