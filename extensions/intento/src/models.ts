import { INodeFunctionBaseParams } from "@cognigy/extension-tools";

export interface IIntentoContext {
	from?: string;
	to: string;
	text: string | string[];
}

export interface IIntentoService {
	routing?: string;
	provider?: string;
	cache?: {
		apply: boolean,
		update: boolean
	}
	storage?: {
		path: string
	}
	trace?: boolean
}

export interface IIntentoBody {
	context: IIntentoContext;
	service?: IIntentoService;
}

export interface ITranslateTextParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			key: string;
		};
		sourceLanguage: string;
		targetLanguage: string;
		text: string | string[];
		storeLocation: string;
		contextKey: string;
		inputKey: string;
		routing?: string;
		additionalLogging?: boolean;
		cache?: boolean;
		cacheInstance?: string;
	};
}