const Spanish = require('../../data/SentiCon/SentiCon.json');

const processSpanish = (tokens: any) => {
	const dictionary = new Map(Object.entries(Spanish));
	for (let token in tokens) {
		if (dictionary.has(tokens[token]) === false) {
			tokens[token] = tokens[token].replace(/ado$|ido$|iendo$|éis$|emos$|amos$|áis$|é$|í$|ió$|ó$|iste$|imos$|isteis$|ieron$|ía$|ías$|íamos$|íais$|ían$|ería$|erías$|eríamos$|eríais$|erían$|eré$|eréis$|erás$|erá$|erán$|eremos$|iera$|ieras$|iéramos$|ierais$|ieran$|iese$|ieses$|iésemos$|ieseis$|iesen$|iere$|ieres$|iéremos|iereis$|ieren$|amos$|asteis$|aron$|aba$|abas$|aste$|ábamos$|abais$|aban$|aría$|arías$|aríamos$|aríais$|arían$|aré$|aréis$|arás$|ará$|arán$|aremos$|ara$|aras$|áramos$|arais$|aran$|ase$|ases$|ásemos$|aseis$|asen$|are$|ares$|áremos|areis$|aren$|o$|as$|a$|an$|e$|es$|en$|ad$|ed$|me$|te$|se$|nos$|os$/, '');
			let saved = tokens[token];
			if (dictionary.has(tokens[token]) === false) {
				tokens[token] = tokens[token].split("").reverse().join("");
				tokens[token] = tokens[token].replace(/o/, 'ue'),
					tokens[token] = tokens[token].replace(/e/, 'ie');
				tokens[token] = tokens[token].split("").reverse().join("");
				if (dictionary.has(tokens[token]) === false) {
					tokens[token] = tokens[token].split("").reverse().join("");
					tokens[token] = saved.replace(/e/, 'i');
					tokens[token] = tokens[token].split("").reverse().join("");
				}
			}
		}
	}
	return (tokens);
};

export default processSpanish;