interface ConfluencePageVersion {
	number: number;
	message: string;
	minorEdit: boolean;
	authorId: string;
	createdAt: string;
	ncsStepVersion: string;
}

interface ConfluencePageStorage {
	representation: string;
	value: string;
}

interface ConfluencePageBody {
	storage: ConfluencePageStorage;
}

interface ConfluencePageLinks {
	editui: string;
	webui: string;
	edituiv2: string;
	tinyui: string;
	base: string;
}

export interface ConfluenceGetPageBodyFormatStorageResponse {
	parentType: string;
	parentId: string;
	lastOwnerId: string;
	ownerId: string;
	createdAt: string;
	authorId: string;
	version: ConfluencePageVersion;
	position: number;
	body: ConfluencePageBody;
	status: string;
	spaceId: string;
	title: string;
	id: string;
	_links: ConfluencePageLinks;
}

export interface ConfluenceGetPageResponse {
	parentType: string;
	parentId: string;
	lastOwnerId: string;
	ownerId: string;
	createdAt: string;
	authorId: string;
	version: ConfluencePageVersion;
	position: number;
	spaceId: string;
	body: Record<string, unknown>;
	status: string;
	title: string;
	id: string;
	_links: ConfluencePageLinks;
}

interface ConfluencePageDescendant {
	id: string;
	status: string;
	title: string;
	parentId: string;
	depth: number;
	childPosition: number;
	type: string;
}

interface ConfluenceBaseLinks {
	base: string;
	next?: string;
}

export interface ConfluenceGetPageDescendantsResponse {
	results: ConfluencePageDescendant[];
	_links: ConfluenceBaseLinks;
}
