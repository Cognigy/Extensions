# Neo4j Extension for Cognigy.AI

Query a Neo4j database from Cognigy flows using an LLM‑generated Cypher query. This extension:

- Connects to your Neo4j instance via HTTPS with Basic Auth
- Reads the graph schema (labels, properties, relationships)
- Uses an OpenAI model to translate a natural‑language prompt into a valid Cypher query
- Executes the Cypher and stores the results on `input` or `context`


## Features

- Smart Query node: Provide a free‑form question; the node generates and runs Cypher
- Schema‑aware prompting: The LLM is constrained to your actual labels, properties, and relationships
- Flexible storage: Choose where to store the result in your flow (`input` or `context`)


## Requirements

- Cognigy.AI with support for custom Extensions
- A reachable Neo4j instance with HTTPS HTTP API access
  - Credentials with permission to run `db.schema.*` procedures and read queries
- An OpenAI API key with access to the chosen Chat Completions model


## Installation

1. Install dependencies:
   - `npm install`
2. Build and package the extension:
   - `npm run build`
   - This transpiles TypeScript, runs lint, and creates `neo4j.tar.gz`
3. Import into Cognigy.AI:
   - In the Cognigy.AI UI, go to Extensions → Import and upload `neo4j.tar.gz`


## Configuration

Create the following Connections in Cognigy after importing the extension:

- Neo4j Connection (`neo4jConnection`):
  - `Host`: The HTTPS base host of your Neo4j HTTP API (e.g. `your-neo4j-host` or `<id>.databases.neo4j.io`)
  - `Username`
  - `Password`
- OpenAI API Key (`openAiApiKey`):
  - `openAiKey`: Your OpenAI API key

Notes:
- The extension calls `https://<Host>/db/neo4j/query/v2` and expects HTTPS.
- Ensure your Neo4j version exposes the HTTP API and supports `db.schema.visualization()` and `db.schema.nodeTypeProperties()`.


## Node: Neo4j Query

Add the “Neo4j Query” node to your flow and configure:

- Smart Query (`input`): A free‑form question or instruction. Default references `input.text`.
- Store Location (`storeLocation`): `input` or `context`.
- Input Key / Context Key: Target property name for the result object (default: `neo4jQueryResult`).
- Advanced:
  - OpenAI LLM Model (`model`): Default `gpt-4.1-mini`.
  - OpenAI Connection: Select your API key connection.
  - Neo4j Connection: Select your Neo4j connection.


## How It Works

1. Reads node labels, properties, and relationship types from Neo4j via:
   - `CALL db.schema.nodeTypeProperties()`
   - `CALL db.schema.visualization()`
2. Builds a strict system prompt listing only your available labels, properties, and relationships.
3. Calls OpenAI Chat Completions with your message to generate a Cypher statement.
4. Executes the Cypher via Neo4j HTTP API and returns structured records.
5. Stores an object at the configured location/key:

```
{
  cypher: "MATCH ... RETURN ...",
  result: [ { field1: value, field2: value, ... }, ... ]
}
```

If no valid Cypher can be generated using the available schema, the node throws an error. Handle this with Try/Catch or node error handling in your flow.


## Example

- Smart Query: "List all products and their categories created after 2022."
- The node generates schema‑conformant Cypher, executes it, and stores `{ cypher, result }` under `input.neo4jQueryResult` (or `context.neo4jQueryResult`).


## Security & Data Handling

- The extension sends high‑level schema metadata (labels, properties, relationship types) and your prompt to OpenAI to generate Cypher.
- Do not enable this where sharing such metadata is not allowed.
- Ensure HTTPS to Neo4j and least‑privilege credentials.


## Development

- Transpile TypeScript: `npm run transpile`
- Lint: `npm run lint`
- Build package: `npm run build` → produces `neo4j.tar.gz`


## Troubleshooting

- 401/403 from Neo4j: Check `Host`, `Username`, `Password`, and HTTPS reachability.
- Model errors: Ensure your OpenAI key has access to the configured `model`.
- Empty or unexpected results: Verify the graph contains relevant data and the Smart Query aligns with your schema.
- "No valid Cypher possible": The question cannot be answered given current labels/relationships/properties; refine the query or update the schema.


## License

MIT
