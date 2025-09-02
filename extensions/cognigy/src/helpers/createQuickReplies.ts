import { IIntent } from "./intent";

interface IQuickReply {
	contentType: string;
	payload: string;
	title: string;
}

export function createQuickReplies(input: any, intents: IIntent[]): IQuickReply[] {

	const quickReplies: IQuickReply[] = [];

	// Add the main intent at the first position of the quick reply array
	quickReplies.push({
		title: input.nlu.intentMapperResults.finalIntentDisambiguationSentence,
		payload: input.nlu.intentMapperResults.finalIntentDisambiguationSentence,
		contentType: 'postback'
	});

	// Always add the first found intent as second quick reply
	quickReplies.push({
		title: intents[0].disambiguationSentence,
		payload: intents[0].disambiguationSentence,
		contentType: 'postback'
	});

	switch (intents.length) {
		case 1:
			break;
		case 2:
			quickReplies.push({
				title: intents[1].disambiguationSentence,
				payload: intents[1].disambiguationSentence,
				contentType: 'postback'
			});
			break;
		default:
			quickReplies.push({
				title: intents[1].disambiguationSentence,
				payload: intents[1].disambiguationSentence,
				contentType: 'postback'
			});
			quickReplies.push({
				title: intents[2].disambiguationSentence,
				payload: intents[2].disambiguationSentence,
				contentType: 'postback'
			});
	}

	return quickReplies;
}
