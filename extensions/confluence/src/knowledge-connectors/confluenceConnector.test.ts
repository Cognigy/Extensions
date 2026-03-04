import * as assert from "node:assert";
import { beforeEach, describe, it, mock } from "node:test";
import type {
	CreateKnowledgeChunkReturnValue,
	CreateKnowledgeSourceReturnValue,
	DeleteKnowledgeSourceReturnValue,
	KnowledgeApi,
	UpsertKnowledgeSourceReturnValue,
} from "@cognigy/extension-tools/build/interfaces/knowledgeConnector";
import { confluenceConnector } from "./confluenceConnector";
import type {
	ConfluenceGetPageBodyFormatStorageResponse,
	ConfluenceGetPageDescendantsResponse,
	ConfluenceGetPageResponse,
} from "./types";

type DeepPartial<T> = {
	[K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : Partial<T[K]>;
};

describe("confluenceConnector", () => {
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

	const mockGetPageResponse = (
		response: DeepPartial<ConfluenceGetPageResponse> = {
			id: "123456789",
			title: "Page Title",
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

	const mockGetPageDescendantsResponse = (
		response: DeepPartial<ConfluenceGetPageDescendantsResponse> = {},
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

	const mockGetPageBodyFormatStorageResponse = (
		response: DeepPartial<ConfluenceGetPageBodyFormatStorageResponse> = {
			body: {
				storage: {
					value:
						"<h1>Heading 1</h1><p>Content under heading 1.</p><h2>Heading 2</h2><p>Content under heading 2.</p>",
				},
			},
			_links: {
				webui: "/spaces/SPACE/pages/123456789/Page+Title",
			},
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

	it("should create a new knowledge store with chunks", async () => {
		mockGetPageBodyFormatStorageResponse();
		mockGetPageResponse();
		upsertKnowledgeSourceResult = { knowledgeSourceId: "source-123" };

		await confluenceConnector.function({
			api: mockApi as KnowledgeApi,
			config: {
				connection: {
					email: "foo@example.com",
					key: "bar",
				},
				confluenceUrl:
					"https://example.atlassian.net/wiki/spaces/SPACE/pages/123456789/Page+Title",
				descendants: false,
				sourceTags: [],
			},
			sources: [],
		});

		// Knowledge source upsert
		assert.partialDeepStrictEqual(
			mockApi.upsertKnowledgeSource.mock.calls[0].arguments[0],
			{
				name: "Page Title",
				description: "Data from Page Title",
				tags: [],
				chunkCount: 2,
				externalIdentifier: "123456789",
			},
		);
		assert.ok(
			mockApi.upsertKnowledgeSource.mock.calls[0].arguments[0]
				.contentHashOrTimestamp,
		);

		// Chunk creation
		assert.strictEqual(mockApi.createKnowledgeChunk.mock.calls.length, 2);
		assert.partialDeepStrictEqual(
			mockApi.createKnowledgeChunk.mock.calls[0].arguments[0],
			{
				knowledgeSourceId: "source-123",
				text: "Page Title\n# Heading 1\nContent under heading 1.",
				data: {
					heading: "Heading 1",
					url: "https://example.atlassian.net/wiki/spaces/SPACE/pages/123456789/Page+Title",
				},
			},
		);
		assert.partialDeepStrictEqual(
			mockApi.createKnowledgeChunk.mock.calls[1].arguments[0],
			{
				knowledgeSourceId: "source-123",
				text: "Page Title\n# Heading 1 -> ## Heading 2\nContent under heading 2.",
				data: {
					heading: "Heading 2",
					url: "https://example.atlassian.net/wiki/spaces/SPACE/pages/123456789/Page+Title",
				},
			},
		);

		assert.strictEqual(mockApi.deleteKnowledgeSource.mock.calls.length, 0);
	});

	it("should create a new knowledge store with chunks from a folder with descendants", async () => {
		mockGetPageBodyFormatStorageResponse({
			body: {
				storage: {
					value:
						"<h1>Heading 1 from child page of a child page</h1><p>Content under heading 1.</p>",
				},
			},
			_links: {
				webui: "/spaces/SPACE/pages/page-456/Child+page+of+a+child+page",
			},
		});
		mockGetPageBodyFormatStorageResponse({
			body: {
				storage: {
					value: "<h1>Heading 1</h1><p>Content under heading 1.</p>",
				},
			},
			_links: {
				webui: "/spaces/SPACE/pages/page-123/Child+page",
			},
		});
		mockGetPageDescendantsResponse({
			results: [
				{
					id: "page-456",
					title: "Child page of a child page",
					type: "page",
					parentId: "page-123",
					depth: 1,
					childPosition: 0,
					status: "current",
				},
			],
			_links: {
				base: "https://example.atlassian.net/wiki",
			},
		});
		mockGetPageDescendantsResponse({
			results: [
				{
					id: "page-123",
					title: "Child page",
					type: "page",
					parentId: "folder-123",
					depth: 1,
					childPosition: 0,
					status: "current",
				},
			],
			_links: {
				base: "https://example.atlassian.net/wiki",
				next: "/wiki/api/v2/pages/page-123/descendants",
			},
		});
		mockGetPageDescendantsResponse({
			results: [],
			_links: {
				base: "https://example.atlassian.net/wiki",
				next: "/wiki/api/v2/folder/123/descendants",
			},
		});
		mockApi.upsertKnowledgeSource.mock.mockImplementation(() =>
			Promise.resolve(
				mockApi.upsertKnowledgeSource.mock.callCount() > 0
					? { knowledgeSourceId: "source-456" }
					: { knowledgeSourceId: "source-123" },
			),
		);

		await confluenceConnector.function({
			api: mockApi as KnowledgeApi,
			config: {
				connection: {
					email: "foo@example.com",
					key: "bar",
				},
				confluenceUrl:
					"https://example.atlassian.net/wiki/spaces/SPACE/folder/123/Folder+name",
				descendants: true,
				sourceTags: ["with-descendants"],
			},
			sources: [],
		});

		// Knowledge source upsert
		assert.partialDeepStrictEqual(
			mockApi.upsertKnowledgeSource.mock.calls[0].arguments[0],
			{
				name: "Child page",
				description: "Data from Child page",
				tags: ["with-descendants"],
				chunkCount: 1,
				externalIdentifier: "page-123",
			},
		);
		assert.ok(
			mockApi.upsertKnowledgeSource.mock.calls[0].arguments[0]
				.contentHashOrTimestamp,
		);
		assert.partialDeepStrictEqual(
			mockApi.upsertKnowledgeSource.mock.calls[1].arguments[0],
			{
				name: "Child page of a child page",
				description: "Data from Child page of a child page",
				tags: ["with-descendants"],
				chunkCount: 1,
				externalIdentifier: "page-456",
			},
		);
		assert.ok(
			mockApi.upsertKnowledgeSource.mock.calls[1].arguments[0]
				.contentHashOrTimestamp,
		);

		// Chunk creation
		assert.strictEqual(mockApi.createKnowledgeChunk.mock.calls.length, 2);
		assert.partialDeepStrictEqual(
			mockApi.createKnowledgeChunk.mock.calls[0].arguments[0],
			{
				knowledgeSourceId: "source-123",
				text: "Child page\n# Heading 1\nContent under heading 1.",
				data: {
					heading: "Heading 1",
					url: "https://example.atlassian.net/wiki/spaces/SPACE/pages/page-123/Child+page",
				},
			},
		);
		assert.partialDeepStrictEqual(
			mockApi.createKnowledgeChunk.mock.calls[1].arguments[0],
			{
				knowledgeSourceId: "source-456",
				text: "Child page of a child page\n# Heading 1 from child page of a child page\nContent under heading 1.",
				data: {
					heading: "Heading 1 from child page of a child page",
					url: "https://example.atlassian.net/wiki/spaces/SPACE/pages/page-456/Child+page+of+a+child+page",
				},
			},
		);

		assert.strictEqual(mockApi.deleteKnowledgeSource.mock.calls.length, 0);
	});

	it("should upsert to an existing knowledge store with chunks", async () => {
		mockGetPageBodyFormatStorageResponse({
			body: {
				storage: {
					value:
						"<h1>Heading 1</h1><p>Content under heading 1.</p><h2>Heading 2</h2><p>Content under heading 2.</p><h1>Heading 1</h1><p>Content under heading 1.</p>",
				},
			},
			_links: {
				webui: "/spaces/SPACE/pages/123456789/Page+Title",
			},
		});
		mockGetPageResponse();
		upsertKnowledgeSourceResult = { knowledgeSourceId: "source-123" };

		await confluenceConnector.function({
			api: mockApi as KnowledgeApi,
			config: {
				connection: {
					email: "foo@example.com",
					key: "bar",
				},
				confluenceUrl:
					"https://example.atlassian.net/wiki/spaces/SPACE/pages/123456789/Page+Title",
				descendants: false,
				sourceTags: [],
			},
			sources: [
				{
					knowledgeSourceId: "source-123",
					name: "Page Title",
					description: "Data from Page Title",
					chunkCount: 2,
					externalIdentifier: "123456789",
					tags: [],
					contentHashOrTimestamp: "hash",
				},
			],
		});

		// Knowledge source upsert
		assert.partialDeepStrictEqual(
			mockApi.upsertKnowledgeSource.mock.calls[0].arguments[0],
			{
				name: "Page Title",
				description: "Data from Page Title",
				tags: [],
				chunkCount: 3,
				externalIdentifier: "123456789",
			},
		);

		// Chunk creation
		assert.strictEqual(mockApi.createKnowledgeChunk.mock.calls.length, 3);

		// No calls to deletion method as the source is managed automatically by the real API during calls to createKnowledgeChunk
		assert.strictEqual(mockApi.deleteKnowledgeSource.mock.calls.length, 0);
	});

	it("should upsert a knowledge store with chunks and delete outdated sources", async () => {
		mockGetPageBodyFormatStorageResponse();
		mockGetPageResponse({
			id: "987654321",
			title: "New page Title",
		});
		upsertKnowledgeSourceResult = { knowledgeSourceId: "new-source-123" };

		await confluenceConnector.function({
			api: mockApi as KnowledgeApi,
			config: {
				connection: {
					email: "foo@example.com",
					key: "bar",
				},
				confluenceUrl:
					"https://example.atlassian.net/wiki/spaces/SPACE/pages/987654321/New+page+Title",
				descendants: false,
				sourceTags: [],
			},
			sources: [
				{
					knowledgeSourceId: "old-source-123",
					name: "Page Title",
					description: "Data from Page Title",
					chunkCount: 2,
					externalIdentifier: "123456789",
					tags: [],
					contentHashOrTimestamp: "hash",
				},
			],
		});

		// Knowledge source upsert
		assert.partialDeepStrictEqual(
			mockApi.upsertKnowledgeSource.mock.calls[0].arguments[0],
			{
				name: "New page Title",
				description: "Data from New page Title",
				tags: [],
				chunkCount: 2,
				externalIdentifier: "987654321",
			},
		);

		// Chunk creation
		assert.strictEqual(mockApi.createKnowledgeChunk.mock.calls.length, 2);

		// Knowledge source deletion
		assert.strictEqual(
			mockApi.deleteKnowledgeSource.mock.calls[0].arguments[0]
				.knowledgeSourceId,
			"old-source-123",
		);
	});

	it("should skip chunk ingestion when upsert returns null", async () => {
		mockGetPageBodyFormatStorageResponse();
		mockGetPageResponse();
		upsertKnowledgeSourceResult = null;

		await confluenceConnector.function({
			api: mockApi as KnowledgeApi,
			config: {
				connection: {
					email: "foo@example.com",
					key: "bar",
				},
				confluenceUrl:
					"https://example.atlassian.net/wiki/spaces/SPACE/pages/123456789/Page+Title",
				descendants: false,
				sourceTags: [],
			},
			sources: [
				{
					knowledgeSourceId: "source-123",
					name: "Page Title",
					description: "Data from Page Title",
					chunkCount: 2,
					externalIdentifier: "123456789",
					tags: [],
					contentHashOrTimestamp: "hash",
				},
			],
		});

		// Knowledge source upsert
		assert.partialDeepStrictEqual(
			mockApi.upsertKnowledgeSource.mock.calls[0].arguments[0],
			{
				name: "Page Title",
				description: "Data from Page Title",
				tags: [],
				chunkCount: 2,
				externalIdentifier: "123456789",
			},
		);

		// Chunk creation
		assert.strictEqual(mockApi.createKnowledgeChunk.mock.calls.length, 0);

		// Knowledge source deletion
		assert.strictEqual(mockApi.deleteKnowledgeSource.mock.calls.length, 0);
	});
});
