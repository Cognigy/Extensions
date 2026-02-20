import * as assert from "node:assert";
import { beforeEach, describe, it, mock } from "node:test";
import type {
	CreateKnowledgeChunkReturnValue,
	CreateKnowledgeSourceReturnValue,
	DeleteKnowledgeSourceReturnValue,
	KnowledgeApi,
	UpsertKnowledgeSourceReturnValue,
} from "@cognigy/extension-tools/build/interfaces/knowledgeConnector";
import { diffbotWebpageConnector } from "./diffbotWebpageConnector";
import type { DiffbotArticle, DiffbotV3AnalyzeResponse } from "./types";

type DeepPartial<T> = {
	[K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : Partial<T[K]>;
};

describe("diffbotWebpageConnector", () => {
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

	const defaultArticle: DiffbotArticle = {
		title: "Test Article",
		type: "article",
		diffbotUri: "article|3|abc123",
		text: "This is the article content.",
		humanLanguage: "en",
		pageUrl: "https://example.com/article",
		siteName: "Example",
		date: "2025-01-01",
		sentiment: 0,
		shareLinks: false,
		icon: "",
		html: "<p>Should be filtered</p>",
		images: [],
		breadcrumb: [],
		categories: [],
		tags: [],
	};

	const mockDiffbotAnalyzeResponse = (
		response: DeepPartial<DiffbotV3AnalyzeResponse> = {
			objects: [defaultArticle],
			title: "Test Page",
			type: "article",
			humanLanguage: "en",
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

	it("should create a new knowledge source with chunks", async () => {
		mockDiffbotAnalyzeResponse();
		upsertKnowledgeSourceResult = { knowledgeSourceId: "source-123" };

		const url = "https://example.com/article";
		await diffbotWebpageConnector.function({
			api: mockApi as KnowledgeApi,
			config: {
				connection: { accessToken: "test-token" },
				urls: [url],
				extractApiType: "analyze",
				sourceTags: [],
			},
			sources: [],
		});

		// Knowledge source upsert
		assert.strictEqual(mockApi.upsertKnowledgeSource.mock.calls.length, 1);
		assert.partialDeepStrictEqual(
			mockApi.upsertKnowledgeSource.mock.calls[0].arguments[0],
			{
				name: "Test Article",
				description: `Content from web page at ${url}`,
				tags: [],
				chunkCount: 1,
				externalIdentifier: `0.article|3|abc123@${url}`,
			},
		);
		assert.ok(
			mockApi.upsertKnowledgeSource.mock.calls[0].arguments[0]
				.contentHashOrTimestamp,
		);

		// Chunk creation
		assert.strictEqual(mockApi.createKnowledgeChunk.mock.calls.length, 1);
		assert.partialDeepStrictEqual(
			mockApi.createKnowledgeChunk.mock.calls[0].arguments[0],
			{
				knowledgeSourceId: "source-123",
				data: {
					url,
					title: "Test Article",
					language: "en",
					type: "article",
				},
			},
		);

		// No deletions
		assert.strictEqual(mockApi.deleteKnowledgeSource.mock.calls.length, 0);
	});

	it("should create knowledge sources for response with multiple objects", async () => {
		mockDiffbotAnalyzeResponse({
			objects: [
				{
					...defaultArticle,
					title: "First Article",
					diffbotUri: "article|3|first",
				},
				{
					...defaultArticle,
					title: "Second Article",
					diffbotUri: "article|3|second",
				},
			],
		});
		mockApi.upsertKnowledgeSource.mock.mockImplementation(() =>
			Promise.resolve(
				mockApi.upsertKnowledgeSource.mock.callCount() > 0
					? { knowledgeSourceId: "source-456" }
					: { knowledgeSourceId: "source-123" },
			),
		);

		const url = "https://example.com/page";
		await diffbotWebpageConnector.function({
			api: mockApi as KnowledgeApi,
			config: {
				connection: { accessToken: "test-token" },
				urls: [url],
				extractApiType: "analyze",
				sourceTags: ["web"],
			},
			sources: [],
		});

		// Knowledge source upserts
		assert.strictEqual(mockApi.upsertKnowledgeSource.mock.calls.length, 2);
		assert.partialDeepStrictEqual(
			mockApi.upsertKnowledgeSource.mock.calls[0].arguments[0],
			{
				name: "First Article",
				description: `Content from web page at ${url}`,
				tags: ["web"],
				externalIdentifier: `0.article|3|first@${url}`,
			},
		);
		assert.partialDeepStrictEqual(
			mockApi.upsertKnowledgeSource.mock.calls[1].arguments[0],
			{
				name: "Second Article",
				description: `Content from web page at ${url}`,
				tags: ["web"],
				externalIdentifier: `1.article|3|second@${url}`,
			},
		);

		// Chunk creation — one chunk per object
		assert.strictEqual(mockApi.createKnowledgeChunk.mock.calls.length, 2);
		assert.partialDeepStrictEqual(
			mockApi.createKnowledgeChunk.mock.calls[0].arguments[0],
			{
				knowledgeSourceId: "source-123",
				data: {
					url,
					title: "First Article",
					language: "en",
					type: "article",
				},
			},
		);
		assert.partialDeepStrictEqual(
			mockApi.createKnowledgeChunk.mock.calls[1].arguments[0],
			{
				knowledgeSourceId: "source-456",
				data: {
					url,
					title: "Second Article",
					language: "en",
					type: "article",
				},
			},
		);

		// No deletions
		assert.strictEqual(mockApi.deleteKnowledgeSource.mock.calls.length, 0);
	});

	it("should upsert an existing knowledge source with chunks", async () => {
		mockDiffbotAnalyzeResponse();
		upsertKnowledgeSourceResult = { knowledgeSourceId: "source-123" };

		const url = "https://example.com/article";
		await diffbotWebpageConnector.function({
			api: mockApi as KnowledgeApi,
			config: {
				connection: { accessToken: "test-token" },
				urls: [url],
				extractApiType: "analyze",
				sourceTags: [],
			},
			sources: [
				{
					knowledgeSourceId: "source-123",
					name: "Test Article",
					description: `Content from web page at ${url}`,
					chunkCount: 1,
					externalIdentifier: `0.article|3|abc123@${url}`,
					tags: [],
					contentHashOrTimestamp: "previous-hash",
				},
			],
		});

		// Knowledge source upsert
		assert.partialDeepStrictEqual(
			mockApi.upsertKnowledgeSource.mock.calls[0].arguments[0],
			{
				name: "Test Article",
				description: `Content from web page at ${url}`,
				tags: [],
				chunkCount: 1,
				externalIdentifier: `0.article|3|abc123@${url}`,
			},
		);

		// Chunks created
		assert.strictEqual(mockApi.createKnowledgeChunk.mock.calls.length, 1);

		// No deletions (same externalIdentifier)
		assert.strictEqual(mockApi.deleteKnowledgeSource.mock.calls.length, 0);
	});

	it("should upsert a knowledge source and delete outdated sources", async () => {
		mockDiffbotAnalyzeResponse();
		upsertKnowledgeSourceResult = { knowledgeSourceId: "new-source-123" };

		const url = "https://example.com/article";
		await diffbotWebpageConnector.function({
			api: mockApi as KnowledgeApi,
			config: {
				connection: { accessToken: "test-token" },
				urls: [url],
				extractApiType: "analyze",
				sourceTags: [],
			},
			sources: [
				{
					knowledgeSourceId: "old-source-123",
					name: "Old Article",
					description: "Content from web page at https://example.com/old",
					chunkCount: 1,
					externalIdentifier: "0.article|3|old@https://example.com/old",
					tags: [],
					contentHashOrTimestamp: "old-hash",
				},
			],
		});

		// New source created
		assert.strictEqual(mockApi.upsertKnowledgeSource.mock.calls.length, 1);
		assert.strictEqual(mockApi.createKnowledgeChunk.mock.calls.length, 1);

		// Old source deleted
		assert.strictEqual(mockApi.deleteKnowledgeSource.mock.calls.length, 1);
		assert.strictEqual(
			mockApi.deleteKnowledgeSource.mock.calls[0].arguments[0]
				.knowledgeSourceId,
			"old-source-123",
		);
	});

	it("should skip chunk ingestion when upsert returns null", async () => {
		mockDiffbotAnalyzeResponse();
		upsertKnowledgeSourceResult = null;

		const url = "https://example.com/article";
		await diffbotWebpageConnector.function({
			api: mockApi as KnowledgeApi,
			config: {
				connection: { accessToken: "test-token" },
				urls: [url],
				extractApiType: "analyze",
				sourceTags: [],
			},
			sources: [
				{
					knowledgeSourceId: "source-123",
					name: "Test Article",
					description: `Content from web page at ${url}`,
					chunkCount: 1,
					externalIdentifier: `0.article|3|abc123@${url}`,
					tags: [],
					contentHashOrTimestamp: "hash",
				},
			],
		});

		// Upsert was called
		assert.strictEqual(mockApi.upsertKnowledgeSource.mock.calls.length, 1);

		// No chunks created (content unchanged)
		assert.strictEqual(mockApi.createKnowledgeChunk.mock.calls.length, 0);

		// No deletions
		assert.strictEqual(mockApi.deleteKnowledgeSource.mock.calls.length, 0);
	});

	it("should throw error when no data is returned from Diffbot", async () => {
		mockDiffbotAnalyzeResponse({ objects: [] });

		const url = "https://example.com/article";
		await assert.rejects(
			() =>
				diffbotWebpageConnector.function({
					api: mockApi as KnowledgeApi,
					config: {
						connection: { accessToken: "test-token" },
						urls: [url],
						extractApiType: "analyze",
						sourceTags: [],
					},
					sources: [],
				}),
			{
				message: `No data returned from Diffbot for URL: ${url}`,
			},
		);
	});
});
