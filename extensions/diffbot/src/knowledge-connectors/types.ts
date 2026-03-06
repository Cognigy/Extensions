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

// Crawler API Types

/**
 * Settings for creating a Diffbot crawl job
 */
export interface CrawlJobSettings {
	name: string;
	seeds: string[];
	apiUrl: string;

	// Crawling Settings
	urlCrawlPattern?: string[];
	urlCrawlRegEx?: string;
	maxToCrawl?: number;
	maxToCrawlPerSubdomain?: number;
	maxHops?: number;
	crawlDelay?: number;
	obeyRobots?: boolean;
	restrictDomain?: boolean;
	restrictSubdomain?: boolean;
	useProxies?: boolean;
	useCanonical?: boolean;

	// Processing Settings
	urlProcessPattern?: string[];
	urlProcessRegEx?: string;
	pageProcessPattern?: string[];
	maxToProcess?: number;
	maxToProcessPerSubdomain?: number;

	// Custom Headers
	userAgent?: string;
	referer?: string;
	cookie?: string;
	acceptLanguage?: string;
}

/**
 * Represents a single result object extracted from a crawled page.
 * The shape matches the output from Diffbot Extract APIs (Article, Product, etc.)
 */
export interface DiffbotResult {
	title?: string;
	type?: string;
	pageUrl?: string;
	html?: string;
	humanLanguage?: string;
	text?: string;
	[key: string]: any; // Allow for additional properties from various Extract API types
}

/**
 * Job status information returned by the Crawl API
 * Status codes:
 * 0 = Job is initializing
 * 1 = Job has reached maxRounds limit
 * 2 = Job has reached maxToCrawl limit
 * 3 = Job has reached maxToProcess limit
 * 4 = Next round to start in _ seconds
 * 5 = No URLs were added to the crawl
 * 6 = Job paused
 * 7 = Job in progress
 * 8 = All crawling temporarily paused by root administrator for maintenance
 * 9 = Job has completed and no repeat is scheduled
 * 10 = Failed to crawl any seed
 * 11 = Job automatically paused because crawl is inefficient
 */
export interface DiffbotJobStatus {
	status: number;
	message: string;
}

/**
 * Detailed information about a crawl job returned by the Crawl API
 */
export interface DiffbotCrawlJob {
	name: string;
	type: string;
	jobCreationTimeUTC: number;
	jobCompletionTimeUTC: number;
	jobStatus: DiffbotJobStatus;
	sentJobDoneNotification: number;
	objectsFound: number;
	urlsHarvested: number;
	pageCrawlAttempts: number;
	pageCrawlSuccesses: number;
	pageCrawlSuccessesThisRound: number;
	pageProcessAttempts: number;
	pageProcessSuccesses: number;
	pageProcessSuccessesThisRound: number;
	maxRounds: number;
	repeat: number;
	crawlDelay: number;
	obeyRobots: number;
	maxToCrawl: number;
	maxToProcess: number;
	onlyProcessIfNew?: number;
	seeds: string;
	roundsCompleted: number;
	roundStartTime: number;
	currentTime: number;
	currentTimeUTC: number;
	apiUrl: string;
	urlCrawlPattern: string;
	urlProcessPattern: string;
	pageProcessPattern: string;
	urlCrawlRegEx: string;
	urlProcessRegEx: string;
	maxHops: number;
	downloadJson: string;
	downloadUrls: string;
	notifyEmail?: string;
	notifyWebhook?: string;
	useCanonical?: number;
	useProxies?: number;
	customHeaders?: Record<string, string>;
	seedRecrawlFrequency?: number;
	maxToCrawlPerSubdomain?: number;
	maxToProcessPerSubdomain?: number;
	restrictDomain?: number;
	restrictSubdomain?: number;
}

/**
 * Response from creating a crawl job (POST /v3/crawl)
 */
export interface DiffbotCreateCrawlResponse {
	response: string;
	jobs: DiffbotCrawlJob[];
}

/**
 * Response from getting crawl job status (GET /v3/crawl)
 */
export interface DiffbotJobStatusResponse {
	jobs: DiffbotCrawlJob[];
}
