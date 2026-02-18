---
name: add-knowledge-connector
description: Guide for adding a new Knowledge Connector to a Cognigy Extension. Knowledge Connectors enable Cognigy AI users to fetch data from external knowledge bases (like Confluence, SharePoint, wikis) and create Knowledge chunks for storage in vector databases to be used by AI Agents. This skill covers file structure, implementation patterns, and best practices.
---

# Adding a New Knowledge Connector to an Extension

Knowledge Connectors integrate external knowledge sources with Cognigy.AI's Knowledge AI system. They fetch content from third-party systems, process it into chunks, and make it searchable by AI Agents.

## Overview

**What is a Knowledge Connector?**
- A component that fetches data from external knowledge bases
- Processes content into searchable Knowledge Chunks
- Enables AI Agents to access contextual information
- Integrates with Knowledge Stores in Cognigy.AI

**Package Information:**
- Package: `@cognigy/extension-tools` (latest: v0.17.0-rc5)
- Source: [Azure DevOps - Cognigy.AI](https://cognigy.visualstudio.com/Cognigy.AI/_git/cognigy?path=/packages/extension-tools&version=GBtask/123351-kai-connectors-docs)
- NPM: [@cognigy/extension-tools](https://www.npmjs.com/package/@cognigy/extension-tools)

**Examples:**
- [Confluence Connector](../../../extensions/confluence/src/knowledge-connectors/confluenceConnector.ts) - Extracts pages from Confluence
- [Diffbot Crawler](../../../extensions/diffbot/src/knowledge-connectors/diffbotCrawlerConnector.ts) - Crawls and extracts web content
- [Diffbot Webpage](../../../extensions/diffbot/src/knowledge-connectors/diffbotWebpageConnector.ts) - Extracts single webpage content
- [Simple Connector](../../../docs/example/src/knowledge-connectors/simpleKnowledgeConnector.ts) - Basic example

## Required Inputs

Before creating a Knowledge Connector, gather:

1. **Connector Name** (camelCase): e.g., `confluenceConnector`, `sharePointConnector`
2. **Display Label**: User-friendly name shown in UI, e.g., "Confluence", "SharePoint Documents"
3. **Summary**: Brief description of what the connector does
4. **Source System**: The external system to connect to (Confluence, SharePoint, etc.)
5. **Authentication Method**: How to authenticate (API key, OAuth, username/password)
6. **Content Retrieval Logic**: How to fetch content from the source
7. **Chunking Strategy**: How to split content into searchable chunks

## File Structure

A typical Knowledge Connector extension includes:

```
extensions/{extension-name}/
├── src/
│   ├── connections/
│   │   └── {source}Connection.ts         # Authentication credentials
│   ├── knowledge-connectors/
│   │   ├── {connector}Connector.ts       # Main connector definition
│   │   └── helper/                       # Optional utilities
│   │       ├── utils.ts                  # API calls, data fetching
│   │       ├── parser.ts                 # Content parsing logic
│   │       └── chunker.ts                # Text chunking utilities
│   ├── nodes/                            # Optional Flow Nodes
│   │   └── *.ts
│   └── module.ts                         # Extension module definition
├── package.json
├── tsconfig.json
└── README.md
```

## Implementation Steps

### Step 1: Create Connection Schema

**File:** `src/connections/{source}Connection.ts`

Define authentication credentials for the external system.

**Simple Example (API Token):**
```typescript
import type { IConnectionSchema } from "@cognigy/extension-tools";

export const diffbotConnection: IConnectionSchema = {
	type: "diffbot",
	label: "Diffbot Connection",
	fields: [{ fieldName: "accessToken" }],
};
```

**Complex Example (Username/Password):**
```typescript
import type { IConnectionSchema } from "@cognigy/extension-tools";

export const confluenceConnection: IConnectionSchema = {
	type: "confluence",
	label: "Confluence Connection",
	fields: [
		{ fieldName: "domain" },
		{ fieldName: "email" },
		{ fieldName: "key" },
	],
};
```

**Common Connection Field Names:**
- `accessToken` - API token
- `apiKey` - API key
- `username` / `password` - Basic auth
- `email` / `key` - Email + API token
- `domain` / `baseUrl` - Service URL
- `organizationId` - Organization identifier

### Step 2: Create Knowledge Connector

**File:** `src/knowledge-connectors/{connector}Connector.ts`

This is the main connector logic.

**Basic Structure:**
```typescript
import { createKnowledgeConnector } from "@cognigy/extension-tools";
import type { IKnowledge } from "@cognigy/extension-tools";

export const {connector}Connector = createKnowledgeConnector({
	type: "{connector}Connector",
	label: "{Display Label}",
	summary: "Description of what this connector does",
	fields: [
		// Configuration fields
	] as const,  // IMPORTANT: 'as const' enables proper TypeScript inference
	function: async ({ config, api }) => {
		// Vendor specific implementation
	},
});
```

**Important Notes:**
- Always add `as const` after the fields array for proper TypeScript type inference
- The `config` parameter is automatically typed based on your fields
- Import `IKnowledge` type namespace for strongly-typed chunk parameters

**Key Components:**

| Property | Type | Description |
|----------|------|-------------|
| `type` | string | Unique identifier (camelCase with "Connector" suffix) |
| `label` | string | Display name in UI |
| `summary` | string | Brief description shown to users |
| `fields` | array | Configuration fields for the connector |
| `function` | async function | Main execution logic |

### Step 3: Define Configuration Fields

Add fields to configure the connector. Users fill these when setting up the connector in Cognigy.AI and the fields
are vendor specific based on the data needed to connect and fetch content.

**Field Type Reference:**

| Type | Description | Use Case |
|------|-------------|----------|
| `connection` | Connection selector | Authentication credentials |
| `text` | Single-line text | URLs, identifiers |
| `textArray` | Multiple text values | List of URLs, keywords |
| `toggle` | Boolean switch | Enable/disable features |
| `select` | Dropdown menu | Choose from options |
| `number` | Numeric input | Limits, counts, timeouts |
| `chipInput` | Tag input | Source tags, categories |

### Step 4: Implement Connector Function

The `function` is where you fetch content and create Knowledge Chunks.

Make a plan outlining steps to implement, taking into consideration the third-party library and API you will be working with. Common steps include:
1. Validate configuration inputs
2. Authenticate with the external system
3. Fetch content based on configuration
4. Process and chunk content
5. Create Knowledge Source(s) and add chunks using the `api` object methods.

**Function Signature:**
```typescript
// Option 1: Access config properties normally
function: async ({ config, sources, api }) => {
	const { connection, url, tags } = config;
	// ... implementation
}

// Option 2: Destructure config in parameters (cleaner for many fields)
function: async ({ config: { connection, url, tags }, sources, api }) => {
	// Config fields are directly available
	// ... implementation
}
```

**Available Parameters:**
- `config`: Object containing all field values (typed based on your fields with `as const`)
- `sources`: Array of `KnowledgeSource` objects created in previous runs by this connector (useful for incremental updates)
- `api`: Knowledge Connector API object with methods:
  - `createKnowledgeSource(params)`: Create a new knowledge source
  - `upsertKnowledgeSource(params)`: Create or update a knowledge source (v0.17.0+)
  - `createKnowledgeChunk(params)`: Add a chunk to a source
  - `deleteKnowledgeSource(params)`: Delete a source (for cleanup)

**Example Connector**

Use when content is ready to use without complex processing.

```typescript
function: async ({ config, sources, api }) => {
	const { connection, sourceTags } = config;

	// 1. Authenticate with external system using connection credentials
	const authToken = await authenticate(connection);
	
	// 2. Fetch content (e.g., from a URL or API)
	const chunks = await fetchData(connection)
	
	// 3. Create one Knowledge Source
	const knowledgeSource = await api.createKnowledgeSource({
		name: "Example Source",
		description: "Description of the knowledge source",
		tags: sourceTags,
		chunkCount: chunks.length,
	});
	
	// 4. Add chunks
	for (const chunk of chunks) {
		await api.createKnowledgeChunk({
			knowledgeSourceId: knowledgeSource.knowledgeSourceId,
			text: chunk.text,
			data: chunk.data,
		});
	}
}
```

### Step 5: Handle Errors

Implement proper error handling and cleanup.

**Best Practices:**
1. Always wrap connector logic in try-catch
2. Delete Knowledge Sources on failure to avoid orphaned sources
3. Provide descriptive error messages
4. Validate input before processing

```typescript
function: async ({ config: { connection, url, sourceTags }, sources, api }) => {
	// Type assertion for connection (with proper typing)
	const { apiKey } = connection as { apiKey: string };
	
	// Validate inputs
	if (!url) {
		throw new Error("URL is required");
	}
	
	// Create Knowledge Source
	const knowledgeSource = await api.createKnowledgeSource({
		name: "Example Source",
		description: "Example description",
		tags: sourceTags,
		chunkCount: 1, // Will update if needed
	});
	
	try {
		// Fetch content
		const response = await fetch(url, {
			headers: { "Authorization": `Bearer ${apiKey}` }
		});
		
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}
		
		const content = await response.text();
		
		// Validate content
		if (!content || content.length === 0) {
			throw new Error("No content retrieved from URL");
		}
		
		// Process and create chunks
		const chunks = processContent(content);
		
		for (const chunk of chunks) {
			await api.createKnowledgeChunk({
				knowledgeSourceId: knowledgeSource.knowledgeSourceId,
				text: chunk.text,
				data: chunk.data,
			});
		}
	} catch (error) {
		// Clean up on failure
		await api.deleteKnowledgeSource({
			knowledgeSourceId: knowledgeSource.knowledgeSourceId,
		});
		
		// Re-throw with context
		throw new Error(
			`Failed to fetch content from ${url}: ${error instanceof Error ? error.message : String(error)}`
		);
	}
}
```

**Error Handling Patterns:**

| Scenario | Action | Example |
|----------|--------|---------|
| Invalid input | Throw error immediately | `if (!url) throw new Error(...)` |
| API failure | Delete source, re-throw | `await api.deleteKnowledgeSource(...)` |
| Empty results | Delete source, throw error | Check `items.length === 0` |
| Partial failure | Continue or fail based on severity | Log warnings, skip invalid items |

### Step 6: Register Connector in Module

**File:** `src/module.ts`

```typescript
import { createExtension } from "@cognigy/extension-tools";
import { confluenceConnection } from "./connections/confluenceConnection";
import { confluenceConnector } from "./knowledge-connectors/confluenceConnector";
import { searchNode } from "./nodes/search";

export default createExtension({
	nodes: [searchNode],
	connections: [confluenceConnection],
	knowledge: [confluenceConnector],  // Register connector here
	options: {
		label: "Confluence",
	},
});
```

### Step 7: Create Helper Utilities

**File:** `src/knowledge-connectors/helper/utils.ts`

Create reusable helper functions, especially for content hash calculation:

```typescript
import { createHash } from "node:crypto";
import type { IKnowledge } from "@cognigy/extension-tools";

export type ChunkContent = Pick<
	IKnowledge.CreateKnowledgeChunkParams,
	"text" | "data"
>;

/**
 * Calculates a SHA-256 hash from an array of chunks.
 * Used for content-based change detection in upsertKnowledgeSource.
 */
export const calculateContentHash = (chunks: ChunkContent[]): string => {
	const hash = createHash("sha256");
	for (const chunk of chunks) {
		hash.update(chunk.text);
	}
	return hash.digest("hex");
};

/**
 * Example: Fetch and process data from external system
 */
export const fetchDataFromSource = async (url: string, authToken: string) => {
	const response = await fetch(url, {
		headers: { Authorization: `Bearer ${authToken}` },
	});
	
	if (!response.ok) {
		throw new Error(`HTTP ${response.status}: ${response.statusText}`);
	}
	
	return await response.json();
};
```

**Key Points:**
- Use `node:crypto` for SHA-256 hashing (built-in, no dependencies)
- Hash all chunk text content for accurate change detection
- Keep utility functions pure and testable

### Step 8: Update Package Dependencies

**File:** `package.json`

Add any required dependencies:

```json
{
	"dependencies": {
		"@cognigy/extension-tools": "^0.17.0-rc4",  // Latest version with upsertKnowledgeSource
		"@langchain/textsplitters": "^0.0.3",       // For text chunking
		"axios": "^1.6.0",                           // For HTTP requests (optional)
		"jsdom": "^24.0.0"                           // For HTML parsing (optional)
	},
	"devDependencies": {
		"@types/node": "^22.0.0",
		"typescript": "^5.0.0"
	}
}
```

**Version Notes:**
- Use `@cognigy/extension-tools` version ^0.17.0-rc4 or later for full Knowledge Connector support
- v0.17.0+ includes `upsertKnowledgeSource` for incremental updates and `sources` parameter
- Check [NPM](https://www.npmjs.com/package/@cognigy/extension-tools) for the latest version
- Older versions (< 0.16.0) may not support all Knowledge Connector features

### Step 9: Create README Documentation

**File:** `README.md`

Document the connector for users:

```markdown
# {Extension Name}

Integrates Cognigy.AI with {Source System} ({URL})

## Connection

This extension requires a connection with the following fields:

- **{field1}**: Description of field1
- **{field2}**: Description of field2

**How to get credentials:**
1. Step-by-step instructions
2. Screenshots if helpful
3. Link to official documentation

## Knowledge Connectors

### {Connector Name}

Extracts content from {source} and creates Knowledge Chunks for use with Knowledge AI.

**Configuration:**

- **Connection**: Select your {source} connection
- **{Field 1}**: Description and example
- **{Field 2}**: Description and example
- **Source Tags**: Tags to categorize the knowledge source (e.g., "confluence", "documentation")

**How it works:**

1. Connects to {source} using provided credentials
2. Fetches content from specified {location/URL/space}
3. Processes content into searchable chunks
4. Creates Knowledge Source(s) with chunks
5. Makes content available to AI Agents via Knowledge AI

**Example Use Case:**

When building a support agent, use this connector to index your company's documentation. The AI Agent can then:
- Search for relevant information from {source}
- Provide accurate answers based on your documentation
- Cite specific sources when responding to users

## Nodes (if applicable)

### {Node Name}

Description of what the node does...
```

## API Reference

### Knowledge Connector API

The Knowledge Connector API is provided through the `api` parameter in the connector function.

**Type Imports:**
```typescript
import type { IKnowledge } from "@cognigy/extension-tools";

// Use IKnowledge namespace for type definitions
type ChunkParams = IKnowledge.CreateKnowledgeChunkParams;
type SourceParams = IKnowledge.CreateKnowledgeSourceParams;
```

**createKnowledgeSource(params)**

Creates a new Knowledge Source. Returns an object with `knowledgeSourceId`.

```typescript
const { knowledgeSourceId } = await api.createKnowledgeSource({
	name: string,                      // Required: Display name (unique per knowledge store)
	description?: string,               // Optional: Human-readable description
	tags?: string[],                    // Optional: Array of tags for filtering/categorization
	chunkCount: number,                 // Required: Expected total number of chunks to add
	contentHashOrTimestamp?: string,    // Optional: Hash or timestamp for update detection
	externalIdentifier?: string,        // Optional: Unique ID for updates (defaults to name)
});

// Return type: { knowledgeSourceId: string }
```

**upsertKnowledgeSource(params)** - New in v0.17.0

Creates a new Knowledge Source or updates an existing one based on `externalIdentifier` (or `name` if not provided). Returns `{ knowledgeSourceId }` if created/updated, or `null` if source already exists and is up-to-date (based on `contentHashOrTimestamp`).

```typescript
const result = await api.upsertKnowledgeSource({
	name: string,                      // Required: Display name
	description?: string,               // Optional: Description
	tags?: string[],                    // Optional: Tags
	chunkCount: number,                 // Required: Expected chunk count
	contentHashOrTimestamp?: string,    // Optional: For detecting if source needs update
	externalIdentifier?: string,        // Optional: Unique ID (defaults to name)
});

// Return type: { knowledgeSourceId: string } | null
// null = source exists and contentHashOrTimestamp matches (no update needed)
```

**Use Case for upsertKnowledgeSource:**
- Incremental updates: Only re-index if content changed
- Check `sources` parameter for existing sources
- Use `contentHashOrTimestamp` to detect changes
- Returns `null` if source is up-to-date (skip re-indexing)

```typescript
function: async ({ config, sources, api }) => {
	// Check if source already exists and is up-to-date
	const latestHash = await getContentHash(config.url);
	const existingSource = sources.find(s => s.name === "My Source");
	
	if (existingSource?.contentHashOrTimestamp === latestHash) {
		// Content unchanged, skip re-indexing
		return;
	}
	
	// Create or update source
	const result = await api.upsertKnowledgeSource({
		name: "My Source",
		contentHashOrTimestamp: latestHash,
		chunkCount: chunks.length,
	});
	
	if (result === null) {
		// Source exists and is up-to-date
		return;
	}
	
	// Add chunks to new/updated source
	for (const chunk of chunks) {
		await api.createKnowledgeChunk({
			knowledgeSourceId: result.knowledgeSourceId,
			text: chunk.text,
		});
	}
}
```

**createKnowledgeChunk(params)**

Adds a chunk to a Knowledge Source. Must be called after creating the source.

```typescript
await api.createKnowledgeChunk({
	knowledgeSourceId: string,                    // Required: ID from createKnowledgeSource
	text: string,                                 // Required: The actual text content (max ~4000 chars recommended)
	data?: Record<string, string | number | boolean>  // Optional: Custom metadata object
});

// Return type: {} (Promise<{}>)
```

**deleteKnowledgeSource(params)**

Deletes a Knowledge Source and all its chunks. Used primarily for error handling/cleanup.

```typescript
await api.deleteKnowledgeSource({
	knowledgeSourceId: string,  // Required: ID of source to delete
});

// Return type: {} (Promise<{}>)
```

**Type-Safe Usage:**
```typescript
import type { IKnowledge } from "@cognigy/extension-tools";

// Use IKnowledge namespace types in helper functions
type ChunkParams = IKnowledge.CreateKnowledgeChunkParams;
type SourceParams = IKnowledge.CreateKnowledgeSourceParams;
type KnowledgeSource = IKnowledge.KnowledgeSource;
type KnowledgeApi = IKnowledge.KnowledgeApi;

// Define chunk type for helper functions
type ChunkContent = Pick<ChunkParams, "text" | "data">;

function processContent(content: string): ChunkContent[] {
	return [{
		text: content,
		data: { processed: true }
	}];
}

// Access sources from previous runs
function findExistingSource(
	sources: KnowledgeSource[],
	name: string
): KnowledgeSource | undefined {
	return sources.find(s => s.name === name || s.externalIdentifier === name);
}
```

## Best Practices

### 1. Chunk Size and Overlap

**Optimal chunk size:** 1000-2000 characters
- Too small: Loss of context
- Too large: Irrelevant information interferes with retrieval

**Chunk overlap:** 100-200 characters
- Helps preserve context across chunk boundaries
- Ensures important information isn't split

```typescript
const splitter = new RecursiveCharacterTextSplitter({
	chunkSize: 2000,
	chunkOverlap: 200,
});
```

### 2. Metadata in Chunks

Add metadata to chunks for better context:

```typescript
await api.createKnowledgeChunk({
	knowledgeSourceId,
	text: chunkText,
	data: {
		url: sourceUrl,           // Link to original
		author: pageAuthor,       // Who created it
		lastModified: timestamp,  // When updated
		type: "documentation",    // Content type
		section: "API Reference", // Section name
	},
});
```

### 3. Error Handling

Always clean up on failure:

```typescript
try {
	// Process content
} catch (error) {
	await api.deleteKnowledgeSource({ knowledgeSourceId });
	throw error;
}
```

### 4. Incremental Updates with Syncing support (v0.17.0+)

Use `upsertKnowledgeSource` with content hashing and automatic cleanup for full sync behavior:

```typescript
import { createHash } from "node:crypto";
import type { IKnowledge } from "@cognigy/extension-tools";

// Helper function to calculate content hash from chunks
function calculateContentHash(chunks: Array<{ text: string }>): string {
	const hash = createHash("sha256");
	for (const chunk of chunks) {
		hash.update(chunk.text);
	}
	return hash.digest("hex");
}

function: async ({ config, sources: currentSources, api }) => {
	const items = await fetchItemsFromExternalSystem(config);
	const updatedSources = new Set<string>();
	
	// Process each item
	for (const item of items) {
		const chunks = await processItemIntoChunks(item);
		const contentHash = calculateContentHash(chunks);
		
		// Create or update source
		const result = await api.upsertKnowledgeSource({
			name: item.title,
			description: item.description,
			chunkCount: chunks.length,
			contentHashOrTimestamp: contentHash,
			externalIdentifier: item.id,
		});
		
		// Track this item as processed
		updatedSources.add(item.id);
		
		if (result === null) {
			// Source already up-to-date, skip chunk creation
			continue;
		}
		
		// Add chunks to new or updated source
		for (const chunk of chunks) {
			await api.createKnowledgeChunk({
				knowledgeSourceId: result.knowledgeSourceId,
				...chunk,
			});
		}
	}
	
	// Clean up sources that are no longer in the external system
	for (const source of currentSources) {
		if (updatedSources.has(source.externalIdentifier)) {
			continue;
		}
		
		await api.deleteKnowledgeSource({
			knowledgeSourceId: source.knowledgeSourceId,
		});
	}
}
```

**Key Patterns:**
- **Content hash**: Calculate SHA-256 from chunk text content for accurate change detection
- **Track updates**: Use `Set<string>` to track processed external identifiers
- **Always track**: Add to `updatedSources` before checking if upsert returned null
- **Cleanup**: Delete sources whose `externalIdentifier` is not in `updatedSources`
- **Efficiency**: Skip chunk creation when `upsertKnowledgeSource` returns null

**Benefits:**
- Accurate change detection via content hashing
- Automatic removal of deleted/removed items from source system
- Minimal re-indexing (only changed content is updated)
- Full synchronization between external system and Knowledge AI

## Testing Your Connector

### Manual Testing Steps

1. **Install the Extension** in Cognigy.AI
2. **Create a Connection** with valid credentials
3. **Create a Knowledge Store**
4. **Add your Knowledge Connector** to the store
5. **Configure the connector** with test data
6. **Run the connector** and verify:
   - Knowledge Sources are created
   - Chunks contain correct content
   - Tags are applied correctly
   - Metadata is accurate
7. **Test in an AI Agent**:
   - Create a Flow with Knowledge AI
   - Query the knowledge store
   - Verify relevant chunks are retrieved

## Complete Examples

### Example 1: Simple Web Page Connector

```typescript
import { createKnowledgeConnector } from "@cognigy/extension-tools";
import { JSDOM } from "jsdom";

async function splitTextIntoChunks(text: string, maxSize: number = 2000): Promise<string[]> {
	// Simple implementation - use RecursiveCharacterTextSplitter for production
	const chunks: string[] = [];
	for (let i = 0; i < text.length; i += maxSize) {
		chunks.push(text.slice(i, i + maxSize));
	}
	return chunks;
}

export const webpageConnector = createKnowledgeConnector({
	type: "webpageConnector",
	label: "Web Page",
	summary: "Extract content from web pages",
	fields: [
		{
			key: "urls",
			label: "URLs",
			type: "textArray",
			description: "List of web page URLs to extract content from",
			params: { required: true },
		},
		{
			key: "sourceTags",
			label: "Source Tags",
			type: "chipInput",
			defaultValue: ["webpage"],
			description: "Tags for filtering and categorization",
		},
	] as const,
	function: async ({ config: { urls, sourceTags }, sources, api }) => {
		for (const url of urls) {
			// Fetch content
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
			}
			const html = await response.text();
			
			// Parse and extract text
			const dom = new JSDOM(html);
			const document = dom.window.document;
			const title = document.querySelector("title")?.textContent || url;
			const text = document.body.textContent || "";
			
			// Split into chunks
			const chunks = await splitTextIntoChunks(text, 2000);
			
			// Create Knowledge Source
			const { knowledgeSourceId } = await api.createKnowledgeSource({
				name: title,
				description: `Content from ${url}`,
				tags: sourceTags,
				chunkCount: chunks.length,
			});
			
			// Add chunks
			for (const chunk of chunks) {
				await api.createKnowledgeChunk({
					knowledgeSourceId,
					text: chunk,
					data: { url },
				});
			}
		}
	},
});
```

### Example 2: API-Based Connector with Pagination

```typescript
import { createKnowledgeConnector } from "@cognigy/extension-tools";
import type { IKnowledge } from "@cognigy/extension-tools";

interface ApiResponse {
	items: Array<{
		id: string;
		title: string;
		description: string;
		content: string;
		category: string;
		url: string;
	}>;
	hasMore: boolean;
}

export const apiConnector = createKnowledgeConnector({
	type: "apiConnector",
	label: "API Documentation",
	summary: "Extract documentation from API",
	fields: [
		{
			key: "connection",
			label: "API Connection",
			type: "connection",
			params: {
				connectionType: "api",
				required: true,
			},
		},
		{
			key: "category",
			label: "Category",
			type: "text",
			description: "Documentation category to fetch",
			params: { required: true },
		},
		{
			key: "maxPages",
			label: "Maximum Pages",
			type: "number",
			defaultValue: 100,
			description: "Maximum number of API pages to fetch",
		},
		{
			key: "sourceTags",
			label: "Source Tags",
			type: "chipInput",
			defaultValue: ["api-docs"],
		},
	] as const,
	function: async ({ 
		config: { connection, category, maxPages, sourceTags }, 
		sources,
		api 
	}) => {
		const { apiKey } = connection as { apiKey: string };
		
		let page = 1;
		let hasMore = true;
		const allItems: ApiResponse["items"] = [];
		
		// Fetch all pages with pagination
		while (hasMore && page <= maxPages) {
			const response = await fetch(
				`https://api.example.com/docs?category=${category}&page=${page}`,
				{
					headers: { "Authorization": `Bearer ${apiKey}` },
				}
			);
			
			if (!response.ok) {
				throw new Error(`API request failed: ${response.statusText}`);
			}
			
			const data: ApiResponse = await response.json();
			allItems.push(...data.items);
			hasMore = data.hasMore;
			page++;
			
			// Rate limiting - wait 250ms between requests
			await new Promise(resolve => setTimeout(resolve, 250));
		}
		
		if (allItems.length === 0) {
			throw new Error(`No documentation found for category: ${category}`);
		}
		
		// Create Knowledge Source
		const { knowledgeSourceId } = await api.createKnowledgeSource({
			name: `API Docs - ${category}`,
			description: `Documentation for ${category}`,
			tags: sourceTags,
			chunkCount: allItems.length,
		});
		
		// Add chunks
		for (const item of allItems) {
			const text = `${item.title}\n\n${item.description}\n\n${item.content}`;
			
			await api.createKnowledgeChunk({
				knowledgeSourceId,
				text,
				data: {
					id: item.id,
					category: item.category,
					url: item.url,
					title: item.title,
				},
			});
		}
	},
});
```

### Example 3: Sample connector with full syncing support (v0.17.0+)

Based on Confluence connector implementation - demonstrates production-grade patterns:

```typescript
import { createHash } from "node:crypto";
import { createKnowledgeConnector } from "@cognigy/extension-tools";
import type { IKnowledge } from "@cognigy/extension-tools";

// Helper function - can be exported from utils file
function calculateContentHash(chunks: Array<{ text: string }>): string {
	const hash = createHash("sha256");
	for (const chunk of chunks) {
		hash.update(chunk.text);
	}
	return hash.digest("hex");
}

export const productionConnector = createKnowledgeConnector({
	type: "productionConnector",
	label: "Production Connector",
	summary: "Full sync with content hashing and automatic cleanup",
	fields: [
		{
			key: "connection",
			label: "API Connection",
			type: "connection",
			params: { connectionType: "api", required: true },
		},
		{
			key: "baseUrl",
			label: "Base URL",
			type: "text",
			description: "Base URL of the content source",
			params: { required: true },
		},
		{
			key: "sourceTags",
			label: "Source Tags",
			type: "chipInput",
			defaultValue: ["incremental"],
		},
	] as const,
	function: async ({ config, sources: currentSources, api }) => {
		const { connection, baseUrl, sourceTags } = config;
		const { apiKey } = connection as { apiKey: string };
		
		// 1. Fetch all items from external system
		const items = await fetchAllItems(baseUrl, apiKey);
		const updatedSources = new Set<string>();
		
		// 2. Process each item
		for (const item of items) {
			// Fetch and process chunks
			const chunks = await fetchAndProcessChunks(baseUrl, apiKey, item.id);
			
			// Calculate content hash
			const contentHash = calculateContentHash(chunks);
			
			// Create or update knowledge source
			const result = await api.upsertKnowledgeSource({
				name: item.title,
				description: `Data from ${item.title}`,
				tags: sourceTags,
				chunkCount: chunks.length,
				externalIdentifier: item.id,
				contentHashOrTimestamp: contentHash,
			});
			
			// Track this item as processed
			updatedSources.add(item.id);
			
			if (result === null) {
				// Source already up-to-date
				continue;
			}
			
			// Add chunks to new or updated source
			for (const chunk of chunks) {
				await api.createKnowledgeChunk({
					knowledgeSourceId: result.knowledgeSourceId,
					...chunk,
				});
			}
		}
		
		// 3. Clean up sources that no longer exist in external system
		for (const source of currentSources) {
			if (updatedSources.has(source.externalIdentifier)) {
				continue;
			}
			
			await api.deleteKnowledgeSource({
				knowledgeSourceId: source.knowledgeSourceId,
			});
		}
	},
});

async function fetchAllItems(baseUrl: string, apiKey: string) {
	// Fetch all items with pagination
	const response = await fetch(`${baseUrl}/api/items`, {
		headers: { Authorization: `Bearer ${apiKey}` },
	});
	return await response.json();
}

async function fetchAndProcessChunks(baseUrl: string, apiKey: string, itemId: string) {
	// Fetch item content and split into chunks
	const response = await fetch(`${baseUrl}/api/items/${itemId}`, {
		headers: { Authorization: `Bearer ${apiKey}` },
	});
	const content = await response.json();
	
	// Process into chunks (use text splitter, parse HTML, etc.)
	return [
		{
			text: content.body,
			data: { url: content.url, author: content.author },
		},
	];
}
```

**Production Patterns:**
- ✅ **Parameter naming**: `sources: currentSources` for clarity
- ✅ **Content hashing**: SHA-256 hash from all chunk text
- ✅ **Tracking**: `Set<string>` for processed external identifiers
- ✅ **Always track**: Add to set before checking upsert result
- ✅ **Cleanup**: Delete sources not in updated set
- ✅ **Efficiency**: Skip chunk creation when content unchanged

**Real-World Example:**
See [Confluence Connector](../../../extensions/confluence/src/knowledge-connectors/confluenceConnector.ts) for complete production implementation.

## Checklist

- [ ] Create connection schema in `src/connections/{source}Connection.ts`
- [ ] Create connector in `src/knowledge-connectors/{connector}Connector.ts`
- [ ] Define configuration fields (connection, URL/identifiers, options, tags)
- [ ] Implement connector function (fetch, process, chunk, upsert with cleanup)
- [ ] Create helper functions if needed (utils, parser, chunker, content hash calculator)
- [ ] Implement content hash calculation using Node.js crypto (SHA-256)
- [ ] Track processed sources with `Set` and cleanup superseded sources
- [ ] Add error handling and cleanup
- [ ] Register connector in `src/module.ts`
- [ ] Update `package.json` with dependencies (v0.17.0-rc4+)
- [ ] Write README documentation with examples

## Additional Resources

- **Extension Tools Package**
  - NPM: [@cognigy/extension-tools](https://www.npmjs.com/package/@cognigy/extension-tools)
  - Source: [Azure DevOps - Cognigy.AI](https://cognigy.visualstudio.com/Cognigy.AI/_git/cognigy?path=/packages/extension-tools)
- **Cognigy Documentation**
  - [Knowledge AI Documentation](https://docs.cognigy.com/ai/empower/knowledge-ai/overview)
  - [Knowledge Stores](https://docs.cognigy.com/ai/empower/knowledge-ai/knowledge-store/)
  - [Extension Development Guide](https://support.cognigy.com/hc/en-us/articles/360016534459)
- **Example Code**
  - [Example Extension](../../../docs/example/)
  - [Confluence Extension](../../../extensions/confluence/)
  - [Diffbot Extension](../../../extensions/diffbot/)
  - [Microsoft SharePoint Extension](../../../extensions/microsoft-sharepoint/)
