interface IQuickReply {
	content_type: string;
	payload: string;
	title: string;
}

interface IIntent {
	id: string;
	name: string;
	score: number;
	negated: boolean;
	confirmationSentence: string;
	confirmationSentences: any[];
	disambiguationSentence: string;
	flow: string;
	delta: number;
}

export function createQuickReplies(input: any, intents: IIntent[]): IQuickReply[] {

	let quickReplies: IQuickReply[] = [];

	// Add the main intent at the first position of the quick reply array
	quickReplies.push({
		title: input.nlu.intentMapperResults.finalIntentDisambiguationSentence,
		payload: input.nlu.intentMapperResults.finalIntentDisambiguationSentence,
		content_type: 'text'
	});

	// Always add the first found intent as second quick reply
	quickReplies.push({
		title: intents[0].disambiguationSentence,
		payload: intents[0].disambiguationSentence,
		content_type: 'text'
	});

	switch (intents.length) {
		case 1:
			break;
		case 2:
			quickReplies.push({
				title: intents[1].disambiguationSentence,
				payload: intents[1].disambiguationSentence,
				content_type: 'text'
			});
			break;
		default:
			quickReplies.push({
				title: intents[1].disambiguationSentence,
				payload: intents[1].disambiguationSentence,
				content_type: 'text'
			});
			quickReplies.push({
				title: intents[2].disambiguationSentence,
				payload: intents[2].disambiguationSentence,
				content_type: 'text'
			});
	}

	return quickReplies;
}