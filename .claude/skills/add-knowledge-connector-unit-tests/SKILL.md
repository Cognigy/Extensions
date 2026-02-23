---
name: add-knowledge-connector-unit-tests
description: Guide for adding unit tests to a Knowledge Connector in a Cognigy Extension. Covers project setup (dependencies, scripts, build exclusion), test scaffolding using the Node.js standard test library (node:test + node:assert), the standard KnowledgeApi mock pattern, vendor-specific API mocking strategies, required test scenarios, and verification steps.
---

# Adding Unit Tests for a Knowledge Connector

This skill describes how to introduce unit tests for a Knowledge Connector extension using the Node.js standard testing library (`node:test`). Tests validate that connectors correctly create, upsert, and delete Knowledge Sources and Chunks via the `KnowledgeApi`.

## Overview

**Test Framework:** Node.js built-in test runner ([`node:test`](https://nodejs.org/api/test.html))
- Assertions: `node:assert` (`strictEqual`, `partialDeepStrictEqual`, `ok`)
- Mocking: `mock` from `node:test` (`mock.fn()`, `mock.method()`)
- TypeScript execution: `tsx` loader (`--import=tsx`)
- No third-party test frameworks (no Jest, Vitest, or Mocha)

**Reference Implementation:**
- [Confluence Connector Tests](../../../extensions/confluence/src/knowledge-connectors/confluenceConnector.test.ts) - Complete test suite
- [Diffbot Connector Tests](../../../extensions/diffbot/src/knowledge-connectors/diffbotWebpageConnector.test.ts) - Complete test suite

**Related Skills:**
- [Adding a Knowledge Connector](../add-knowledge-connector/SKILL.md) - How to create the connector being tested

## Prerequisites

Before writing tests for a Knowledge Connector, ensure you have:

1. **An existing Knowledge Connector** — A working connector created following the [add-knowledge-connector](../add-knowledge-connector/SKILL.md) skill
2. **Vendor API response types** — A `types.ts` file in the connector's `knowledge-connectors/` directory describing the shapes of vendor API responses. Examples:
   - [Confluence types.ts](../../../extensions/confluence/src/knowledge-connectors/types.ts) — `ConfluenceGetPageResponse`, `ConfluenceGetPageDescendantsResponse`, `ConfluenceGetPageBodyFormatStorageResponse`
   - [Diffbot types.ts](../../../extensions/diffbot/src/knowledge-connectors/types.ts) — `DiffbotV3AnalyzeResponse`, `DiffbotArticle`
3. **Understanding of vendor API calls** — Know which HTTP calls the connector makes (typically via `global.fetch`), in what order, and what response shapes it expects

## Step 1: Project Setup

Three files need to be created or updated to support testing.

### 1.1 Dev Dependencies

Add `tsx` and `@types/node` to `devDependencies` in the extension's `package.json` if not already present:

```json
{
  "devDependencies": {
    "@types/node": "^24.2.0",
    "tsx": "4.21.0",
    "typescript": "5.9.2"
  }
}
```

The nodejs test runner already supports Typescript files but imposes some restrictions on module configurations.
Using `tsx` allows us to run TypeScript test files without pre-compiling them, and it handles the necessary ESM loader configuration under the hood.

### 1.2 NPM Scripts

Add a `test` script and update the `build` script so tests gate the build:

```json
{
  "scripts": {
    "test": "node --test --import=tsx --experimental-test-coverage --test-coverage-exclude='**/*.test.ts'",
    "transpile": "tsc -p tsconfig.production.json",
    "build": "npm run test && npm run transpile && npm run lint && npm run zip"
  }
}
```

**Script breakdown:**
- `--test` — Enables the Node.js built-in test runner
- `--import=tsx` — Loads the `tsx` ESM loader to run TypeScript directly without pre-compilation
- `--experimental-test-coverage` — Generates test coverage report
- `--test-coverage-exclude='**/*.test.ts'` — Excludes test files themselves from coverage metrics

### 1.3 Production TypeScript Config

Create or update `tsconfig.production.json` to exclude test files from the production build output. The base `tsconfig.json` should continue to include test files so the IDE provides type checking.

**`tsconfig.production.json`:**
```jsonc
{
  "extends": "./tsconfig.json",
  "exclude": [
    "node_modules",
    "build",
    "./vscode",
    "**/*.test.ts",
  ]
}
```

Generally only the `**/*.test.ts` pattern needs to be added to exclude test files from the base `tsconfig.json`.

Ensure the `transpile` script in `package.json` uses the production config:
```json
"transpile": "tsc -p tsconfig.production.json"
```

## Step 2: Test File Structure

### File Location and Naming

Test files are colocated with the connector code:

```
extensions/{extension-name}/
├── src/
│   └── knowledge-connectors/
│       ├── {connector}Connector.ts           # Connector implementation
│       ├── {connector}Connector.test.ts      # Test file (same name as connector)
│       ├── types.ts                         # Vendor API response types
│       └── helper/
│           └── utils.ts                     # Utilities under test
```

**Convention:** The test file has the same name as the connector file with a `.test.ts` suffix. Create one test file per knowledge connector in an extension.

### Standard Imports

Every test file starts with these imports:

```typescript
import * as assert from "node:assert";
import { beforeEach, describe, it, mock } from "node:test";
import type {
	CreateKnowledgeChunkReturnValue,
	CreateKnowledgeSourceReturnValue,
	DeleteKnowledgeSourceReturnValue,
	KnowledgeApi,
	UpsertKnowledgeSourceReturnValue,
} from "@cognigy/extension-tools/build/interfaces/knowledgeConnector";
```

Then import the connector(s) under test and vendor-specific types:

```typescript
import { myConnector } from "./myConnector";
import type { VendorApiResponse, VendorListResponse } from "./types";
```

### DeepPartial Utility Type

Define this utility type at the top of the test file. It allows creating mock vendor API responses with only the fields relevant to each test, without requiring every property:

```typescript
type DeepPartial<T> = {
	[K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : Partial<T[K]>;
};
```

## Step 3: KnowledgeApi Mock Pattern

This is the standard, vendor-agnostic mock setup that applies to **every** knowledge connector test. It mocks the `api` parameter passed to the connector's function.

### 3.1 Declare Result Variables and Mock API

Inside the `describe` block, declare variables to control what each API method returns:

```typescript
describe("myConnector", () => {
	let mockApi: { [K in keyof KnowledgeApi]?: it.Mock<KnowledgeApi[K]> } = {};
	let createKnowledgeSourceResult: CreateKnowledgeSourceReturnValue;
	let deleteKnowledgeSourceResult: DeleteKnowledgeSourceReturnValue;
	let upsertKnowledgeSourceResult: UpsertKnowledgeSourceReturnValue;
	let createKnowledgeChunkResult: CreateKnowledgeChunkReturnValue;
```

### 3.2 Initialize Mocks in beforeEach

Reset all mocks before each test. Each mock function resolves with its corresponding result variable:

```typescript
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
```

### 3.3 Setting Return Values per Test

Before calling the connector function in each test, set the result variables to control behavior:

```typescript
	it("should create a new knowledge source", async () => {
		// Set what upsertKnowledgeSource will return
		upsertKnowledgeSourceResult = { knowledgeSourceId: "source-123" };

		// ... set up vendor mocks, then call connector
	});
```

**Special case — null upsert (content unchanged):**
```typescript
	it("should skip ingestion when content is unchanged", async () => {
		upsertKnowledgeSourceResult = null; // API signals no update needed
		// ...
	});
```

### 3.4 Dynamic Mock Behavior

For tests where a mock needs to return different values across multiple calls (e.g., processing multiple pages), use `mockImplementation`:

```typescript
	mockApi.upsertKnowledgeSource.mock.mockImplementation(() =>
		Promise.resolve(
			mockApi.upsertKnowledgeSource.mock.callCount() > 0
				? { knowledgeSourceId: "source-456" }
				: { knowledgeSourceId: "source-123" },
		),
	);
```

### 3.5 Calling the Connector

Invoke the connector's function with the mock API, configuration, and sources:

```typescript
	await myConnector.function({
		api: mockApi as KnowledgeApi,
		config: {
			connection: {
				// Vendor-specific auth fields
			},
			// Vendor-specific config fields matching the connector's `fields` definition
		},
		sources: [], // Empty for new sources, populated for upsert/delete scenarios
	});
```

The `sources` parameter simulates existing Knowledge Sources from previous connector runs:

```typescript
	// For upsert/delete tests, provide existing sources:
	sources: [
		{
			knowledgeSourceId: "source-123",
			name: "Source Name",
			description: "Data from Source Name",
			chunkCount: 2,
			externalIdentifier: "vendor-id-123",
			tags: [],
			contentHashOrTimestamp: "hash",
		},
	],
```

## Step 4: Vendor-Specific API Mocking

Knowledge connectors typically use `global.fetch` to call vendor APIs. This section describes how to mock those calls.

### Approach

Follow a tiered approach based on available information:

1. **When `types.ts` exists in the connector directory**: Use the exported types with `DeepPartial<>` to build mock responses. Examine the connector's function implementation to identify each `fetch` call and its expected response shape. Implement mock helpers on a best-effort basis.

2. **When vendor API documentation is publicly available**: Research the vendor's API reference to build accurate mock response shapes, even if `types.ts` is incomplete. Implement on a best-effort basis.

3. **When neither types nor documentation are available**: Flag the vendor-specific mocking as requiring developer collaboration. Leave `TODO` stubs with `// DEVELOPER COLLABORATION REQUIRED:` markers explaining what data shape is needed and why.

### Mock Helper Functions

Create helper functions that mock `global.fetch` for each vendor API endpoint. Use `{ times: 1 }` so mocks are consumed in order — this allows stacking multiple sequential API call mocks.

```typescript
	const mockVendorGetItemResponse = (
		response: DeepPartial<VendorGetItemResponse> = {
			// Sensible defaults for the most common test case
			id: "item-123",
			title: "Item Title",
			content: "<p>Some content</p>",
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
```

**Key points:**
- Each helper accepts an optional `DeepPartial<VendorType>` parameter with sensible defaults
- `{ times: 1 }` ensures the mock is consumed once, then the next stacked mock takes over
- Mocks are stacked in **reverse call order** — the last mock registered is consumed first
- The mock returns an object matching the `fetch` Response interface (`ok`, `json()`)

### Stacking Multiple API Call Mocks

When the connector makes multiple sequential API calls, stack mocks in reverse order:

```typescript
	it("should handle multiple API calls", async () => {
		// These are consumed in reverse order (last registered = first consumed)
		mockVendorGetContentResponse(); // Consumed second (by the content fetch)
		mockVendorGetItemResponse();    // Consumed first (by the item metadata fetch)
		upsertKnowledgeSourceResult = { knowledgeSourceId: "source-123" };

		await myConnector.function({ /* ... */ });
	});
```

### Error Response Mocking

To test error handling, mock fetch to return non-ok responses:

```typescript
	const mockVendorErrorResponse = (status = 404, statusText = "Not Found") =>
		mock.method(
			global,
			"fetch",
			async () => ({
				ok: false,
				status,
				statusText,
			}),
			{ times: 1 },
		);
```

### Using types.ts for Mock Data

The connector's `types.ts` file is the primary reference for constructing realistic mock data. Each exported interface maps to a vendor API response and tells you what fields the connector expects:

```typescript
// In types.ts:
export interface VendorGetItemResponse {
	id: string;
	title: string;
	body: {
		content: { value: string };
	};
	_links: { webUrl: string };
}

// In {connector}Connector.test.ts:
import type { VendorGetItemResponse } from "./types";

const mockGetItemResponse = (
	response: DeepPartial<VendorGetItemResponse> = {
		id: "123",
		title: "Test Item",
		body: { content: { value: "<p>Test content</p>" } },
		_links: { webUrl: "/items/123/Test+Item" },
	},
) => mock.method(global, "fetch", async () => ({
	ok: true,
	json: async () => response,
}), { times: 1 });
```

When `types.ts` is not available, read the connector implementation to identify the response shapes used, then create the mock helpers with the minimal set of fields the connector accesses. Mark these with:

```typescript
// DEVELOPER COLLABORATION REQUIRED: Verify this mock matches the actual vendor API response shape.
// The connector accesses: response.items[].id, response.items[].title, response.nextPageToken
```

## Step 5: Required Test Scenarios

Every knowledge connector test suite should cover these four scenarios.

### 5.1 Create New Source with Chunks

Tests the initial ingestion when no previous sources exist.

```typescript
	it("should create a new knowledge source with chunks", async () => {
		// Arrange: Set up vendor API mocks and upsert result
		// mockVendor...();
		upsertKnowledgeSourceResult = { knowledgeSourceId: "source-123" };

		// Act: Call connector with empty sources
		await myConnector.function({
			api: mockApi as KnowledgeApi,
			config: { /* vendor-specific config */ },
			sources: [],
		});

		// Assert: upsertKnowledgeSource called with correct params
		assert.partialDeepStrictEqual(
			mockApi.upsertKnowledgeSource.mock.calls[0].arguments[0],
			{
				name: "Expected Source Name",
				description: "Data from Expected Source Name",
				tags: [],
				chunkCount: 2, // Expected number of chunks
				externalIdentifier: "vendor-item-id",
			},
		);
		// Assert: contentHashOrTimestamp is set (value varies)
		assert.ok(
			mockApi.upsertKnowledgeSource.mock.calls[0].arguments[0]
				.contentHashOrTimestamp,
		);

		// Assert: createKnowledgeChunk called for each chunk
		assert.strictEqual(mockApi.createKnowledgeChunk.mock.calls.length, 2);
		assert.partialDeepStrictEqual(
			mockApi.createKnowledgeChunk.mock.calls[0].arguments[0],
			{
				knowledgeSourceId: "source-123",
				text: "Expected chunk text content",
				data: {
					// Vendor-specific metadata (e.g., heading, url)
				},
			},
		);

		// Assert: No sources deleted
		assert.strictEqual(mockApi.deleteKnowledgeSource.mock.calls.length, 0);
	});
```

### 5.2 Upsert Existing Source

Tests updating a source that already exists from a previous run.

```typescript
	it("should upsert an existing knowledge source with chunks", async () => {
		// Arrange: Set up vendor API mocks returning updated content
		// mockVendor...();
		upsertKnowledgeSourceResult = { knowledgeSourceId: "source-123" };

		// Act: Call connector with existing source
		await myConnector.function({
			api: mockApi as KnowledgeApi,
			config: { /* vendor-specific config */ },
			sources: [
				{
					knowledgeSourceId: "source-123",
					name: "Source Name",
					description: "Data from Source Name",
					chunkCount: 2,
					externalIdentifier: "vendor-item-id",
					tags: [],
					contentHashOrTimestamp: "previous-hash",
				},
			],
		});

		// Assert: upsertKnowledgeSource called with updated chunk count
		assert.partialDeepStrictEqual(
			mockApi.upsertKnowledgeSource.mock.calls[0].arguments[0],
			{
				name: "Source Name",
				chunkCount: 3, // Updated count
				externalIdentifier: "vendor-item-id",
			},
		);

		// Assert: New chunks created
		assert.strictEqual(mockApi.createKnowledgeChunk.mock.calls.length, 3);

		// Assert: No sources deleted (same externalIdentifier)
		assert.strictEqual(mockApi.deleteKnowledgeSource.mock.calls.length, 0);
	});
```

### 5.3 Delete Outdated Sources

Tests that sources from a previous run are deleted when the connector now points to different content.

```typescript
	it("should delete outdated sources", async () => {
		// Arrange: Set up vendor API mocks for new content
		// mockVendor...();
		upsertKnowledgeSourceResult = { knowledgeSourceId: "new-source-123" };

		// Act: Call connector with sources that have different externalIdentifiers
		await myConnector.function({
			api: mockApi as KnowledgeApi,
			config: { /* vendor-specific config pointing to NEW content */ },
			sources: [
				{
					knowledgeSourceId: "old-source-123",
					name: "Old Source",
					description: "Data from Old Source",
					chunkCount: 2,
					externalIdentifier: "old-vendor-item-id",
					tags: [],
					contentHashOrTimestamp: "hash",
				},
			],
		});

		// Assert: New source created
		assert.strictEqual(mockApi.upsertKnowledgeSource.mock.calls.length, 1);
		assert.strictEqual(mockApi.createKnowledgeChunk.mock.calls.length, 2);

		// Assert: Old source deleted
		assert.strictEqual(
			mockApi.deleteKnowledgeSource.mock.calls[0].arguments[0]
				.knowledgeSourceId,
			"old-source-123",
		);
	});
```

### 5.4 Skip Ingestion on Null Upsert

Tests that when `upsertKnowledgeSource` returns `null` (content hash unchanged), no chunks are created.

```typescript
	it("should skip chunk ingestion when upsert returns null", async () => {
		// Arrange: Set up vendor API mocks
		// mockVendor...();
		upsertKnowledgeSourceResult = null; // Signals content unchanged

		// Act
		await myConnector.function({
			api: mockApi as KnowledgeApi,
			config: { /* vendor-specific config */ },
			sources: [
				{
					knowledgeSourceId: "source-123",
					name: "Source Name",
					description: "Data from Source Name",
					chunkCount: 2,
					externalIdentifier: "vendor-item-id",
					tags: [],
					contentHashOrTimestamp: "hash",
				},
			],
		});

		// Assert: upsertKnowledgeSource was called
		assert.strictEqual(mockApi.upsertKnowledgeSource.mock.calls.length, 1);

		// Assert: No chunks created (content unchanged)
		assert.strictEqual(mockApi.createKnowledgeChunk.mock.calls.length, 0);

		// Assert: No sources deleted
		assert.strictEqual(mockApi.deleteKnowledgeSource.mock.calls.length, 0);
	});
```

## Step 6: Assertion Patterns

### Key Assertion Methods

| Method | Use Case | Example |
|--------|----------|---------|
| `assert.partialDeepStrictEqual(actual, expected)` | Check object contains expected properties (ignores extra) | Verify `upsertKnowledgeSource` params |
| `assert.strictEqual(actual, expected)` | Exact equality for primitives | Check mock call counts |
| `assert.ok(value)` | Truthy check | Verify `contentHashOrTimestamp` is set |

### Accessing Mock Call Data

```typescript
// Number of times a mock was called
mockApi.upsertKnowledgeSource.mock.calls.length

// First argument of the Nth call (0-indexed)
mockApi.upsertKnowledgeSource.mock.calls[0].arguments[0]

// Specific property from a call argument
mockApi.deleteKnowledgeSource.mock.calls[0].arguments[0].knowledgeSourceId

// Total call count (alternative)
mockApi.upsertKnowledgeSource.mock.callCount()
```

### Assertion Examples

```typescript
// Verify source was created with correct metadata
assert.partialDeepStrictEqual(
	mockApi.upsertKnowledgeSource.mock.calls[0].arguments[0],
	{
		name: "Page Title",
		description: "Data from Page Title",
		tags: ["tag1"],
		chunkCount: 2,
		externalIdentifier: "page-123",
	},
);

// Verify a hash/timestamp was generated (don't assert exact value)
assert.ok(
	mockApi.upsertKnowledgeSource.mock.calls[0].arguments[0]
		.contentHashOrTimestamp,
);

// Verify chunk content
assert.partialDeepStrictEqual(
	mockApi.createKnowledgeChunk.mock.calls[0].arguments[0],
	{
		knowledgeSourceId: "source-123",
		text: "Expected text content",
		data: {
			heading: "Section Title",
			url: "https://example.com/page/123",
		},
	},
);

// Verify no deletions occurred
assert.strictEqual(mockApi.deleteKnowledgeSource.mock.calls.length, 0);

// Verify specific source was deleted
assert.strictEqual(
	mockApi.deleteKnowledgeSource.mock.calls[0].arguments[0].knowledgeSourceId,
	"old-source-123",
);
```

## Step 7: Complete Test File Template

Use this template as a starting point. The `KnowledgeApi` mock setup is universal and ready to use. Vendor-specific sections are marked with comments indicating where implementation is needed.

```typescript
import * as assert from "node:assert";
import { beforeEach, describe, it, mock } from "node:test";
import type {
	CreateKnowledgeChunkReturnValue,
	CreateKnowledgeSourceReturnValue,
	DeleteKnowledgeSourceReturnValue,
	KnowledgeApi,
	UpsertKnowledgeSourceReturnValue,
} from "@cognigy/extension-tools/build/interfaces/knowledgeConnector";
// Import the connector(s) under test
import { myConnector } from "./myConnector";
// Import vendor API response types from types.ts (if available)
import type { VendorGetItemResponse, VendorListResponse } from "./types";

type DeepPartial<T> = {
	[K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : Partial<T[K]>;
};

describe("myConnector", () => {
	// ── KnowledgeApi Mock Setup (universal) ──────────────────────────────
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

	// ── Vendor API Mock Helpers ──────────────────────────────────────────
	// Create one helper per vendor API endpoint the connector calls.
	// Use types from ./types.ts with DeepPartial<> for flexible test data.
	// If types.ts is not available, examine the connector implementation
	// to determine what fields are accessed from each API response.

	const mockGetItemResponse = (
		response: DeepPartial<VendorGetItemResponse> = {
			// Default values for the most common test case
			id: "item-123",
			title: "Item Title",
			// Add fields the connector reads from the response
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

	// Add more mock helpers as needed for each vendor API endpoint:
	// const mockListItemsResponse = (...) => ...
	// const mockGetItemContentResponse = (...) => ...

	// ── Test Cases ───────────────────────────────────────────────────────

	it("should create a new knowledge source with chunks", async () => {
		// Arrange: Stack vendor API mocks in reverse call order
		// mockGetItemContentResponse();
		// mockGetItemResponse();
		upsertKnowledgeSourceResult = { knowledgeSourceId: "source-123" };

		// Act
		await myConnector.function({
			api: mockApi as KnowledgeApi,
			config: {
				connection: {
					// Vendor-specific auth fields
				},
				// Vendor-specific config fields
			},
			sources: [],
		});

		// Assert: Knowledge source upsert
		assert.partialDeepStrictEqual(
			mockApi.upsertKnowledgeSource.mock.calls[0].arguments[0],
			{
				name: "Item Title",
				description: "Data from Item Title",
				tags: [],
				chunkCount: 1,
				externalIdentifier: "item-123",
			},
		);
		assert.ok(
			mockApi.upsertKnowledgeSource.mock.calls[0].arguments[0]
				.contentHashOrTimestamp,
		);

		// Assert: Chunk creation
		assert.strictEqual(mockApi.createKnowledgeChunk.mock.calls.length, 1);
		assert.partialDeepStrictEqual(
			mockApi.createKnowledgeChunk.mock.calls[0].arguments[0],
			{
				knowledgeSourceId: "source-123",
				text: "Expected chunk text",
			},
		);

		// Assert: No deletions
		assert.strictEqual(mockApi.deleteKnowledgeSource.mock.calls.length, 0);
	});

	it("should upsert an existing knowledge source with chunks", async () => {
		// Arrange
		// mockVendor...(); with updated content
		upsertKnowledgeSourceResult = { knowledgeSourceId: "source-123" };

		// Act
		await myConnector.function({
			api: mockApi as KnowledgeApi,
			config: { /* vendor-specific config */ },
			sources: [
				{
					knowledgeSourceId: "source-123",
					name: "Item Title",
					description: "Data from Item Title",
					chunkCount: 1,
					externalIdentifier: "item-123",
					tags: [],
					contentHashOrTimestamp: "previous-hash",
				},
			],
		});

		// Assert: Updated source
		assert.partialDeepStrictEqual(
			mockApi.upsertKnowledgeSource.mock.calls[0].arguments[0],
			{
				name: "Item Title",
				externalIdentifier: "item-123",
			},
		);

		// Assert: Chunks created
		assert.ok(mockApi.createKnowledgeChunk.mock.calls.length > 0);

		// Assert: No deletions (same externalIdentifier)
		assert.strictEqual(mockApi.deleteKnowledgeSource.mock.calls.length, 0);
	});

	it("should delete outdated sources", async () => {
		// Arrange: Mock vendor API for new content
		// mockVendor...();
		upsertKnowledgeSourceResult = { knowledgeSourceId: "new-source-123" };

		// Act: Config points to new content, sources contain old data
		await myConnector.function({
			api: mockApi as KnowledgeApi,
			config: { /* vendor-specific config for NEW content */ },
			sources: [
				{
					knowledgeSourceId: "old-source-123",
					name: "Old Item",
					description: "Data from Old Item",
					chunkCount: 2,
					externalIdentifier: "old-item-id",
					tags: [],
					contentHashOrTimestamp: "hash",
				},
			],
		});

		// Assert: New source created
		assert.strictEqual(mockApi.upsertKnowledgeSource.mock.calls.length, 1);

		// Assert: Old source deleted
		assert.strictEqual(
			mockApi.deleteKnowledgeSource.mock.calls[0].arguments[0]
				.knowledgeSourceId,
			"old-source-123",
		);
	});

	it("should skip chunk ingestion when upsert returns null", async () => {
		// Arrange
		// mockVendor...();
		upsertKnowledgeSourceResult = null;

		// Act
		await myConnector.function({
			api: mockApi as KnowledgeApi,
			config: { /* vendor-specific config */ },
			sources: [
				{
					knowledgeSourceId: "source-123",
					name: "Item Title",
					description: "Data from Item Title",
					chunkCount: 1,
					externalIdentifier: "item-123",
					tags: [],
					contentHashOrTimestamp: "hash",
				},
			],
		});

		// Assert: Upsert was called
		assert.strictEqual(mockApi.upsertKnowledgeSource.mock.calls.length, 1);

		// Assert: No chunks created
		assert.strictEqual(mockApi.createKnowledgeChunk.mock.calls.length, 0);

		// Assert: No deletions
		assert.strictEqual(mockApi.deleteKnowledgeSource.mock.calls.length, 0);
	});
});
```

## Step 8: Verification

After implementing the tests, verify at the extension directory level:

### Run Tests
```bash
npm test
```

Expected output: All tests pass with coverage report. Coverage should exclude `*.test.ts` files.

### Verify Build
```bash
npm run build
```

Expected output: Tests pass, then TypeScript compiles, then linting runs, then the archive is created.

### Verify Build Output Excludes Tests
```bash
ls build/**/*.test.* 2>/dev/null && echo "ERROR: Test files in build output" || echo "OK: No test files in build"
```

### Verify Coverage Exclusion

The coverage report printed by `--experimental-test-coverage` should not list any `*.test.ts` files in its file-by-file breakdown.

## Quick Reference

| Aspect | Convention |
|--------|-----------|
| **Test framework** | `node:test` (built-in) |
| **Assertions** | `node:assert` |
| **Mocking** | `mock` from `node:test` |
| **TypeScript loader** | `tsx` (`--import=tsx`) |
| **Test file location** | `src/knowledge-connectors/{connector}Connector.test.ts` |
| **Build exclusion** | `tsconfig.production.json` excludes `**/*.test.ts` |
| **Coverage exclusion** | `--test-coverage-exclude='**/*.test.ts'` |
| **Test in build** | Tests run first: `npm run test && npm run transpile && ...` |
| **KnowledgeApi import** | `@cognigy/extension-tools/build/interfaces/knowledgeConnector` |
| **Fetch mocking** | `mock.method(global, "fetch", ..., { times: 1 })` |
| **Mock response typing** | `DeepPartial<VendorType>` from `./types` |
