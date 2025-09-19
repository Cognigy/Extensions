import { createKnowledgeConnector } from "@cognigy/extension-tools";
import { jsonSplit } from "./helper/chunker";
import { DiffbotCrawler } from "./helper/crawler";
import { processQueryString } from "./helper/utils";

export const diffbotCrawlerConnector = createKnowledgeConnector({
	type: "diffbotCrawlerConnector",
	label: "Diffbot Crawler",
	summary: "This will import web pages contents using Diffbot's Crawler APIs",
	fields: [
		// Basic Settings
		{
			key: "connection",
			label: "Diffbot Connection",
			type: "connection",
			params: {
				connectionType: "diffbot",
				required: true,
			},
		},
		{
			key: "retainCrawler",
			label: "Retain Crawler",
			type: "toggle",
			description:
				"Whether to retain the crawler after the crawling operation, the undeleted crawlers can be seen on Diffbot dashboard.",
			defaultValue: true,
		},
		{
			key: "seeds",
			label: "Seed URLs",
			type: "textArray",
			description:
				"Crawling will start from these URLs. Enter one URL per line or entry.",
			params: {
				required: true,
			},
		},
		{
			key: "extractApiType",
			type: "select",
			label: "Extract API Type",
			defaultValue: "analyze",
			description:
				"Type of Extract API to call i.e. Product, List etc. If type is not known then choose 'Analyze', however the quality of the result may degrade if 'Analyze' type is chosen.",
			params: {
				options: [
					{
						label: "Analyze",
						value: "analyze",
					},
					{
						label: "Product",
						value: "product",
					},
					{
						label: "Article",
						value: "article",
					},
					{
						label: "Event",
						value: "event",
					},
					{
						label: "List",
						value: "list",
					},
					{
						label: "Video",
						value: "video",
					},
					{
						label: "Image",
						value: "image",
					},
					{
						label: "Discussion",
						value: "discussion",
					},
					{
						label: "Faq",
						value: "faq",
					},
					{
						label: "Organization",
						value: "organization",
					},
				],
			},
		},
		{
			key: "querystring",
			label: "Query String",
			description:
				"Query parameters to be passed to Extract API (do not include the leading '?'). Separate multiple parameters with '&', e.g. fields=title,text&timeout=10",
			type: "text",
		},

		// Crawling Limits
		{
			key: "urlCrawlPattern",
			label: "Crawling Patterns",
			type: "textArray",
			description: "Only crawl URLs that contain any of these text strings.",
		},
		{
			key: "urlCrawlRegEx",
			label: "URL Crawling Regex",
			description: "Only crawl URLs matching the regular expression.",
			type: "text",
		},
		{
			key: "maxToCrawl",
			label: "Max to Crawl",
			description: "Maximum number of pages to crawl.",
			type: "number",
			defaultValue: 100,
			params: {
				required: true,
			},
		},
		{
			key: "maxToCrawlPerSubdomain",
			label: "Max to Crawl Per Subdomain",
			description: "Maximum number of pages to crawl per subdomain.",
			type: "number",
			defaultValue: -1,
			params: {
				required: true,
			},
		},
		{
			key: "maxHops",
			label: "Max Hops",
			type: "number",
			description:
				"Maximum number of hops away from a seed URL. Set to -1 for unlimited hops.",
			defaultValue: -1,
			params: {
				required: true,
			},
		},
		{
			key: "crawlDelay",
			label: "Crawl Delay",
			type: "number",
			description:
				"Number of seconds to wait between requests to the same server.",
			defaultValue: 0.25,
			params: {
				required: true,
			},
		},
		{
			key: "obeyRobots",
			label: "Obey Robots",
			type: "toggle",
			description: "Whether to obey robots.txt rules of the website.",
			defaultValue: true,
		},
		{
			key: "restrictDomain",
			label: "Restrict Domain",
			type: "toggle",
			description: "Limit crawling to seed domains.",
			defaultValue: true,
		},
		{
			key: "restrictSubdomain",
			label: "Restrict Subdomain",
			type: "toggle",
			description: "Limit crawling to seed subdomains.",
			defaultValue: false,
		},
		{
			key: "useProxies",
			label: "Use Proxies",
			type: "toggle",
			description: "Whether to use Diffbot's proxy servers for crawling.",
			defaultValue: false,
		},
		{
			key: "useCanonical",
			label: "Canonical Deduplication",
			description: "Whether to skip pages with a differing canonical URL.",
			type: "toggle",
			defaultValue: true,
		},

		// Processing Limits
		{
			key: "urlProcessPattern",
			label: "Processing Patterns",
			description: "Only process URLs that contain any of these text strings.",
			type: "textArray",
		},
		{
			key: "urlProcessRegEx",
			label: "URL Processing Regex",
			description: "Only process URLs matching the regular expression.",
			type: "text",
		},
		{
			key: "pageProcessPattern",
			label: "HTML Processing Patterns",
			description:
				"Only process pages that contain any of these text strings in the HTML.",
			type: "textArray",
		},
		{
			key: "maxToProcess",
			label: "Max to Process",
			type: "number",
			description: "Maximum number of pages to process.",
			defaultValue: 100,
			params: {
				required: true,
			},
		},
		{
			key: "maxToProcessPerSubdomain",
			label: "Max to Process Per Subdomain",
			type: "number",
			description: "Maximum number of pages to process per subdomain.",
			defaultValue: 100,
			params: {
				required: true,
			},
		},

		// Custom Headers
		{
			key: "userAgent",
			label: "User-Agent",
			description: "Custom User-Agent string to use when crawling.",
			type: "text",
		},
		{
			key: "referer",
			label: "Referer",
			description: "Custom Referer header to use when crawling.",
			type: "text",
		},
		{
			key: "cookie",
			label: "Cookie",
			description: "Custom Cookie header to use when crawling.",
			type: "text",
		},
		{
			key: "acceptLanguage",
			label: "Accept-Language",
			description: "Custom Accept-Language header to use when crawling.",
			type: "text",
		},

		// Knowledge Settings
		{
			key: "sourceTags",
			label: "Source Tags",
			type: "chipInput",
			description:
				"Source tags can be used to filter the search scope from the Flow. Press ENTER to add a Source Tag.",
			defaultValue: ["Web Page"],
		},
	] as const,
	sections: [
		{
			key: "BasicSettings",
			label: "Basic Settings",
			defaultCollapsed: true,
			fields: [
				"seeds",
				"extractApiType",
				"querystring",
				"sourceTags",
				"retainCrawler",
			],
		},
		{
			key: "crawlingLimits",
			label: "Crawling Limits",
			defaultCollapsed: true,
			fields: [
				"urlCrawlPattern",
				"urlCrawlRegEx",
				"maxToCrawl",
				"maxToCrawlPerSubdomain",
				"maxHops",
				"crawlDelay",
				"obeyRobots",
				"restrictDomain",
				"restrictSubdomain",
				"useProxies",
				"useCanonical",
			],
		},
		{
			key: "processingLimits",
			label: "Processing Limits",
			defaultCollapsed: true,
			fields: [
				"urlProcessPattern",
				"urlProcessRegEx",
				"pageProcessPattern",
				"maxToProcess",
				"maxToProcessPerSubdomain",
			],
		},
		{
			key: "customHeaders",
			label: "Custom Headers",
			defaultCollapsed: true,
			fields: ["userAgent", "referer", "cookie", "acceptLanguage"],
		},
	],
	form: [
		{ type: "field", key: "connection" },
		{ type: "section", key: "BasicSettings" },
		{ type: "section", key: "crawlingLimits" },
		{ type: "section", key: "processingLimits" },
		{ type: "section", key: "customHeaders" },
	],
	function: async ({ config, api }) => {
		const {
			connection,
			sourceTags,
			extractApiType,
			querystring,
			retainCrawler,
			...crawlerConfig
		} = config;
		const { accessToken } = connection as { accessToken: string };

		// Create Diffbot Crawler instance
		const crawler = new DiffbotCrawler(accessToken);
		const crawlerName = `crawler-${Date.now()}`;
		const qs = processQueryString(querystring);
		const apiUrl = `https://api.diffbot.com/v3/${extractApiType}${qs}`;

		// Create and run a crawl job and get results
		await crawler.createCrawlJob({
			...crawlerConfig,
			name: crawlerName,
			apiUrl: apiUrl,
		});
		const crawledData = await crawler.monitorJobAndGetResults(crawlerName);
		for (const data of crawledData) {
			if (!data.pageUrl) continue;

			const chunkTitle = `title: ${data.title}\ntype: ${data.type}\n`;
			const chunks = await jsonSplit(data, chunkTitle, ["html", "images"]);

			// Create Knowledge Source
			const { knowledgeSourceId } = await api.createKnowledgeSource({
				name: data.title,
				description: `Content from web page at ${data.pageUrl}`,
				tags: sourceTags,
				chunkCount: chunks.length,
			});

			// Create Knowledge Chunks
			for (const chunk of chunks) {
				await api.createKnowledgeChunk({
					knowledgeSourceId,
					text: chunk,
					data: {
						url: data.pageUrl,
						title: data.title || "",
						language: data.humanLanguage || "",
						type: data.type || "",
					},
				});
			}
		}

		// Delete the crawl job if retain crawler is false
		if (!retainCrawler) await crawler.deleteJob(crawlerName);
	},
});
