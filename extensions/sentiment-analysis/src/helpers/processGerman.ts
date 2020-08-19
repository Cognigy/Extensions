const formsDE = require('../../data/stemsDE.json');
const German = require('../../data/Polartlexicon/polartlexicon.json');

const processGerman = (tokens: any) => {
	const dictionary = new Map(Object.entries(German));
	const forms = formsDE;
	for (let token in tokens) {
		let oldToken = tokens[token];
		if (dictionary.has(tokens[token]) === false) {
			tokens[token] = tokens[token].replace(/t$|er$|es$|em$|en$|e$/, '');
			if (dictionary.has(tokens[token]) === false) {
				tokens[token] = oldToken;
				tokens[token] = tokens[token].replace(/ge/, '');
				tokens[token] = tokens[token].replace(/ss/g, 'ß');
				tokens[token] = tokens[token].replace(/ue/g, 'ü');
				tokens[token] = tokens[token].replace(/oe/g, 'ö');
				tokens[token] = tokens[token].replace(/ae/g, 'ä');
				if (dictionary.has(tokens[token]) === false) {
					tokens[token] = tokens[token].replace(/ü/g, 'u');
					tokens[token] = tokens[token].replace(/ö/g, 'o');
					tokens[token] = tokens[token].replace(/ä/g, 'a');
					for (let stem in forms) {
						let exp = new RegExp(stem);
						if (exp.test(tokens[token]) === true) {
							tokens[token] = tokens[token].replace(exp, forms[stem]);
						}
					}
					if (dictionary.has(tokens[token]) === false) {
						tokens[token] = tokens[token].replace(/t$|er$|es$|em$|en$|e$/, '');
						if (dictionary.has(tokens[token]) === false) {
							tokens[token] = tokens[token].replace(/tes$|te$|est$|st$|s$|t$|e$|es$|ere$|er$/, '');
							if (dictionary.has(tokens[token]) === false) {
								tokens[token] = oldToken;
							}
						}
					}
				}
			}
		}
	}
	return (tokens);
};

export default processGerman;