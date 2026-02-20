export interface DiffbotImage {
	naturalHeight: number;
	width: number;
	url: string;
	naturalWidth: number;
	primary: boolean;
	height: number;
}

export interface DiffbotTag {
	score: number;
	sentiment: number;
	count: number;
	label: string;
	uri: string;
	rdfTypes: string[];
}

export interface DiffbotBreadcrumb {
	link: string;
	name: string;
}

export interface DiffbotCategory {
	score: number;
	name: string;
	id: string;
}

export interface DiffbotArticle {
	date: string;
	sentiment: number;
	images: DiffbotImage[];
	shareLinks: boolean;
	icon: string;
	diffbotUri: string;
	siteName: string;
	title: string;
	type: string;
	tags: DiffbotTag[];
	breadcrumb: DiffbotBreadcrumb[];
	humanLanguage: string;
	pageUrl: string;
	html: string;
	categories: DiffbotCategory[];
	text: string;
}

export interface DiffbotRequest {
	options: string[];
	pageUrl: string;
	api: string;
	version: number;
}

export interface DiffbotV3AnalyzeResponse {
	request: DiffbotRequest;
	humanLanguage: string;
	objects: DiffbotArticle[];
	type: string;
	title: string;
}
