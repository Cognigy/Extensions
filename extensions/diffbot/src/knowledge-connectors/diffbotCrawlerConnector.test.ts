import * as assert from "node:assert";
import { beforeEach, describe, it, mock } from "node:test";
import type {
	CreateKnowledgeChunkReturnValue,
	CreateKnowledgeSourceReturnValue,
	DeleteKnowledgeSourceReturnValue,
	KnowledgeApi,
	UpsertKnowledgeSourceReturnValue,
} from "@cognigy/extension-tools/build/interfaces/knowledgeConnector";
import { diffbotCrawlerConnector } from "./diffbotCrawlerConnector";
import type { DiffbotJobStatusResponse, DiffbotResult } from "./types";

type DeepPartial<T> = {
	[K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : Partial<T[K]>;
};

describe("diffbotCrawlerConnector", () => {
	// ── KnowledgeApi Mock Setup ──────────────────────────────
	let mockApi: { [K in keyof KnowledgeApi]?: it.Mock<KnowledgeApi[K]> } = {};
	let createKnowledgeSourceResult: CreateKnowledgeSourceReturnValue;
	let deleteKnowledgeSourceResult: DeleteKnowledgeSourceReturnValue;
	let upsertKnowledgeSourceResult: UpsertKnowledgeSourceReturnValue;
	let createKnowledgeChunkResult: CreateKnowledgeChunkReturnValue;

	beforeEach(() => {
		mockApi = {
			createKnowledgeSource: mock.fn(
				() => Promise.resolve(createKnowledgeSourceResult) as any,
			),
			deleteKnowledgeSource: mock.fn(
				() => Promise.resolve(deleteKnowledgeSourceResult) as any,
			),
			upsertKnowledgeSource: mock.fn(
				() => Promise.resolve(upsertKnowledgeSourceResult) as any,
			),
			createKnowledgeChunk: mock.fn(
				() => Promise.resolve(createKnowledgeChunkResult) as any,
			),
		};
	});

	// ── Diffbot API Mock Helpers ──────────────────────────────

	const defaultCrawlerResult: DiffbotResult = {
		title: "Test Page",
		type: "article",
		pageUrl: "https://example.com/page1",
		text: "This is the page content.",
		humanLanguage: "en",
		html: "<p>Should be filtered</p>",
	};

	/**
	 * Creates a complete config object with all required and optional fields
	 */
	const createTestConfig = (overrides: Record<string, any> = {}) => ({
		connection: { accessToken: "test-token" },
		seeds: ["https://example.com"],
		extractApiType: "analyze",
		querystring: "",
		maxToCrawl: 100,
		maxToCrawlPerSubdomain: -1,
		maxHops: -1,
		crawlDelay: 0.25,
		obeyRobots: true,
		restrictDomain: true,
		restrictSubdomain: false,
		useProxies: false,
		useCanonical: true,
		maxToProcess: 100,
		maxToProcessPerSubdomain: 100,
		sourceTags: ["Web Page"],
		retainCrawler: false,
		urlCrawlPattern: [] as string[],
		urlCrawlRegEx: "",
		urlProcessPattern: [] as string[],
		urlProcessRegEx: "",
		pageProcessPattern: [] as string[],
		userAgent: "",
		referer: "",
		cookie: "",
		acceptLanguage: "",
		...overrides,
	});

	/**
	 * Mocks the POST request to create a crawl job
	 */
	const mockCreateCrawlJobResponse = () =>
		mock.method(
			global,
			"fetch",
			async () => ({
				ok: true,
				json: async () => ({ response: "Job created successfully" }),
			}),
			{ times: 1 },
		);

	/**
	 * Mocks the GET request to check job status
	 * @param status - Job status code (1=Success, 9=Complete)
	 * @param downloadJsonUrl - URL to download crawl results
	 */
	const mockGetJobStatusResponse = (
		response: DeepPartial<DiffbotJobStatusResponse> = {
			jobs: [
				{
					jobStatus: {
						status: 9, // Complete
						message: "Job completed successfully",
					},
					downloadJson: "https://api.diffbot.com/v3/crawl/download/test-job",
				},
			],
		},
	) =>
		mock.method(
			global,
			"fetch",
			async () => ({
				ok: true,
				json: async () => response,
			}),
			{ times: 1 },
		);

	/**
	 * Mocks the GET request to download job data
	 */
	const mockGetJobDataResponse = (
		results: DiffbotResult[] = [defaultCrawlerResult],
	) =>
		mock.method(
			global,
			"fetch",
			async () => ({
				ok: true,
				json: async () => results,
			}),
			{ times: 1 },
		);

	/**
	 * Mocks the DELETE request to delete a crawl job
	 */
	const mockDeleteJobResponse = () =>
		mock.method(
			global,
			"fetch",
			async () => ({
				ok: true,
				json: async () => ({ response: "Job deleted successfully" }),
			}),
			{ times: 1 },
		);

	// ── Test Cases ───────────────────────────────────────────

	it("should create a new knowledge source with chunks from crawled pages", async () => {
		// Arrange: Stack mock responses in reverse call order
		mockDeleteJobResponse(); // Consumed last (delete job)
		mockGetJobDataResponse([defaultCrawlerResult]); // Consumed fourth (get results from download URL)
		mockGetJobStatusResponse(); // Consumed third (check status within getJobData)
		mockGetJobStatusResponse(); // Consumed second (check status in monitor loop)
		mockCreateCrawlJobResponse(); // Consumed first (create job)
		upsertKnowledgeSourceResult = { knowledgeSourceId: "source-123" };

		// Act
		await diffbotCrawlerConnector.function({
			api: mockApi as KnowledgeApi,
			config: createTestConfig(),
			sources: [],
		});

		// Assert: Knowledge source upsert
		assert.strictEqual(mockApi.upsertKnowledgeSource.mock.calls.length, 1);
		assert.partialDeepStrictEqual(
			mockApi.upsertKnowledgeSource.mock.calls[0].arguments[0],
			{
				name: "Test Page",
				description: "Content from web page at https://example.com/page1",
				tags: ["Web Page"],
				externalIdentifier: "https://example.com/page1",
			},
		);
		assert.ok(
			mockApi.upsertKnowledgeSource.mock.calls[0].arguments[0]
				.contentHashOrTimestamp,
		);
		assert.ok(
			mockApi.upsertKnowledgeSource.mock.calls[0].arguments[0].chunkCount > 0,
		);

		// Assert: Chunk creation
		assert.ok(mockApi.createKnowledgeChunk.mock.calls.length > 0);
		assert.partialDeepStrictEqual(
			mockApi.createKnowledgeChunk.mock.calls[0].arguments[0],
			{
				knowledgeSourceId: "source-123",
				data: {
					url: "https://example.com/page1",
					title: "Test Page",
					language: "en",
					type: "article",
				},
			},
		);

		// Assert: No deletions
		assert.strictEqual(mockApi.deleteKnowledgeSource.mock.calls.length, 0);
	});

	it("should create knowledge sources for multiple crawled pages", async () => {
		// Arrange: Multiple crawl results
		const crawlResults = [
			{
				title: "First Page",
				type: "article",
				pageUrl: "https://example.com/page1",
				text: "Content of first page.",
				humanLanguage: "en",
			},
			{
				title: "Second Page",
				type: "article",
				pageUrl: "https://example.com/page2",
				text: "Content of second page.",
				humanLanguage: "en",
			},
		];

		mockDeleteJobResponse();
		mockGetJobDataResponse(crawlResults);
		mockGetJobStatusResponse(); // For getJobData
		mockGetJobStatusResponse(); // For monitor loop
		mockCreateCrawlJobResponse();

		// Mock to return different IDs for each call
		mockApi.upsertKnowledgeSource.mock.mockImplementation(() =>
			Promise.resolve(
				mockApi.upsertKnowledgeSource.mock.callCount() > 0
					? { knowledgeSourceId: "source-456" }
					: { knowledgeSourceId: "source-123" },
			),
		);

		// Act
		await diffbotCrawlerConnector.function({
			api: mockApi as KnowledgeApi,
			config: createTestConfig(),
			sources: [],
		});

		// Assert: Two sources created
		assert.strictEqual(mockApi.upsertKnowledgeSource.mock.calls.length, 2);
		assert.partialDeepStrictEqual(
			mockApi.upsertKnowledgeSource.mock.calls[0].arguments[0],
			{
				name: "First Page",
				description: "Content from web page at https://example.com/page1",
				tags: ["Web Page"],
				externalIdentifier: "https://example.com/page1",
			},
		);
		assert.partialDeepStrictEqual(
			mockApi.upsertKnowledgeSource.mock.calls[1].arguments[0],
			{
				name: "Second Page",
				description: "Content from web page at https://example.com/page2",
				tags: ["Web Page"],
				externalIdentifier: "https://example.com/page2",
			},
		);

		// Assert: Chunks created for both sources
		assert.ok(mockApi.createKnowledgeChunk.mock.calls.length >= 2);

		// Assert: No deletions
		assert.strictEqual(mockApi.deleteKnowledgeSource.mock.calls.length, 0);
	});

	it("should upsert an existing knowledge source with chunks", async () => {
		// Arrange
		mockDeleteJobResponse();
		mockGetJobDataResponse([defaultCrawlerResult]);
		mockGetJobStatusResponse(); // For getJobData
		mockGetJobStatusResponse(); // For monitor loop
		mockCreateCrawlJobResponse();
		upsertKnowledgeSourceResult = { knowledgeSourceId: "source-123" };

		// Act: Call with existing source
		await diffbotCrawlerConnector.function({
			api: mockApi as KnowledgeApi,
			config: createTestConfig(),
			sources: [
				{
					knowledgeSourceId: "source-123",
					name: "Test Page",
					description: "Content from web page at https://example.com/page1",
					chunkCount: 1,
					externalIdentifier: "https://example.com/page1",
					tags: ["Web Page"],
					contentHashOrTimestamp: "previous-hash",
				},
			],
		});

		// Assert: Source upserted
		assert.strictEqual(mockApi.upsertKnowledgeSource.mock.calls.length, 1);
		assert.partialDeepStrictEqual(
			mockApi.upsertKnowledgeSource.mock.calls[0].arguments[0],
			{
				name: "Test Page",
				description: "Content from web page at https://example.com/page1",
				externalIdentifier: "https://example.com/page1",
			},
		);

		// Assert: Chunks created
		assert.ok(mockApi.createKnowledgeChunk.mock.calls.length > 0);

		// Assert: No deletions (same externalIdentifier)
		assert.strictEqual(mockApi.deleteKnowledgeSource.mock.calls.length, 0);
	});

	it("should delete outdated sources when crawl returns different pages", async () => {
		// Arrange: Crawl returns new page
		const newCrawlResult = {
			title: "New Page",
			type: "article",
			pageUrl: "https://example.com/new-page",
			text: "Content of new page.",
			humanLanguage: "en",
		};

		mockDeleteJobResponse();
		mockGetJobDataResponse([newCrawlResult]);
		mockGetJobStatusResponse(); // For getJobData
		mockGetJobStatusResponse(); // For monitor loop
		mockCreateCrawlJobResponse();
		upsertKnowledgeSourceResult = { knowledgeSourceId: "new-source-123" };

		// Act: Existing sources have different externalIdentifier
		await diffbotCrawlerConnector.function({
			api: mockApi as KnowledgeApi,
			config: createTestConfig(),
			sources: [
				{
					knowledgeSourceId: "old-source-123",
					name: "Old Page",
					description: "Content from web page at https://example.com/old-page",
					chunkCount: 1,
					externalIdentifier: "https://example.com/old-page",
					tags: ["Web Page"],
					contentHashOrTimestamp: "old-hash",
				},
			],
		});

		// Assert: New source created
		assert.strictEqual(mockApi.upsertKnowledgeSource.mock.calls.length, 1);
		assert.ok(mockApi.createKnowledgeChunk.mock.calls.length > 0);

		// Assert: Old source deleted
		assert.strictEqual(mockApi.deleteKnowledgeSource.mock.calls.length, 1);
		assert.strictEqual(
			mockApi.deleteKnowledgeSource.mock.calls[0].arguments[0]
				.knowledgeSourceId,
			"old-source-123",
		);
	});

	it("should skip chunk ingestion when upsert returns null", async () => {
		// Arrange
		mockDeleteJobResponse();
		mockGetJobDataResponse([defaultCrawlerResult]);
		mockGetJobStatusResponse(); // For getJobData
		mockGetJobStatusResponse(); // For monitor loop
		mockCreateCrawlJobResponse();
		upsertKnowledgeSourceResult = null; // Content unchanged

		// Act
		await diffbotCrawlerConnector.function({
			api: mockApi as KnowledgeApi,
			config: createTestConfig(),
			sources: [
				{
					knowledgeSourceId: "source-123",
					name: "Test Page",
					description: "Content from web page at https://example.com/page1",
					chunkCount: 1,
					externalIdentifier: "https://example.com/page1",
					tags: ["Web Page"],
					contentHashOrTimestamp: "hash",
				},
			],
		});

		// Assert: Upsert was called
		assert.strictEqual(mockApi.upsertKnowledgeSource.mock.calls.length, 1);

		// Assert: No chunks created (content unchanged)
		assert.strictEqual(mockApi.createKnowledgeChunk.mock.calls.length, 0);

		// Assert: No deletions
		assert.strictEqual(mockApi.deleteKnowledgeSource.mock.calls.length, 0);
	});

	it("should retain crawler when retainCrawler is true", async () => {
		// Arrange: No delete job mock added
		mockGetJobDataResponse([defaultCrawlerResult]);
		mockGetJobStatusResponse(); // For getJobData
		mockGetJobStatusResponse(); // For monitor loop
		mockCreateCrawlJobResponse();
		upsertKnowledgeSourceResult = { knowledgeSourceId: "source-123" };

		// Act
		await diffbotCrawlerConnector.function({
			api: mockApi as KnowledgeApi,
			config: createTestConfig({ retainCrawler: true }),
			sources: [],
		});

		// Assert: Source created successfully
		assert.strictEqual(mockApi.upsertKnowledgeSource.mock.calls.length, 1);
		assert.ok(mockApi.createKnowledgeChunk.mock.calls.length > 0);

		// Note: No assertion on deleteJob since we didn't mock it
		// The test passes because the connector doesn't call deleteJob when retainCrawler is true
	});

	it("should skip pages without pageUrl", async () => {
		// Arrange: Result without pageUrl
		const resultWithoutUrl = {
			title: "Test Page",
			type: "article",
			text: "Content without URL.",
			humanLanguage: "en",
			// pageUrl is missing
		};

		mockDeleteJobResponse();
		mockGetJobDataResponse([resultWithoutUrl]);
		mockGetJobStatusResponse(); // For getJobData
		mockGetJobStatusResponse(); // For monitor loop
		mockCreateCrawlJobResponse();

		// Act
		await diffbotCrawlerConnector.function({
			api: mockApi as KnowledgeApi,
			config: createTestConfig(),
			sources: [],
		});

		// Assert: No sources created (pageUrl is required)
		assert.strictEqual(mockApi.upsertKnowledgeSource.mock.calls.length, 0);
		assert.strictEqual(mockApi.createKnowledgeChunk.mock.calls.length, 0);
	});

	it("should handle query string parameters", async () => {
		// Arrange
		mockDeleteJobResponse();
		mockGetJobDataResponse([defaultCrawlerResult]);
		mockGetJobStatusResponse(); // For getJobData
		mockGetJobStatusResponse(); // For monitor loop
		mockCreateCrawlJobResponse();
		upsertKnowledgeSourceResult = { knowledgeSourceId: "source-123" };

		// Act: With query string parameters
		await diffbotCrawlerConnector.function({
			api: mockApi as KnowledgeApi,
			config: createTestConfig({
				extractApiType: "article",
				querystring: "fields=title,text&timeout=10",
			}),
			sources: [],
		});

		// Assert: Source created successfully (query string was processed)
		assert.strictEqual(mockApi.upsertKnowledgeSource.mock.calls.length, 1);
		assert.ok(mockApi.createKnowledgeChunk.mock.calls.length > 0);
	});
});
