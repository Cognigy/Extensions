
export interface IIntent {
	id: string;
	name: string;
	score: number;
	negated: boolean;
	confirmationSentence: string;
	confirmationSentences: string;
	disambiguationSentence: string;
	flow: string;
	delta: number;
}
