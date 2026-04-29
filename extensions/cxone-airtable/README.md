# AirTable  🗂️

This Cognigy extension integrates with **AirTable**, enabling full record management from your Cognigy flows via the AirTable REST API.

---

## Connection

Create an **AirTable Connection** with your **Personal Access Token** (PAT).

Generate one at: **airtable.com → Account → Developer Hub → Personal Access Tokens**

Required token scopes:
- `data.records:read` — List and Get records
- `data.records:write` — Create, Update, and Delete records
- `schema.bases:read` — List Tables

---

## Nodes

### 📋 List Records

Retrieves records from a table with optional filtering, sorting, and pagination.

| Field                    | Description                                                                    |
|:-------------------------|:-------------------------------------------------------------------------------|
| Base ID                  | AirTable Base ID, e.g., `appXXXXXXXXXXXXXX`                                   |
| Table ID or Name         | Table name (e.g., `Contacts`) or table ID (`tblXXX`)                          |
| Filter by Formula        | AirTable formula filter, e.g., `{Status} = 'Active'`                          |
| View                     | Name or ID of a table view to apply                                            |
| Sort Field / Direction   | Field to sort by and asc/desc order                                            |
| Return Fields            | JSON array of field names to include, e.g., `["Name", "Email"]`               |
| Max Records              | Upper limit on total records returned                                          |
| Page Size                | Records per page (1–100, default 100)                                          |
| Pagination Offset        | Offset token from a previous response to fetch the next page                  |

**Response shape:** `{ records: [...], offset: "..." }`

---

### 🔍 Get Record

Retrieves a single record by its ID.

| Field              | Description                                      |
|:-------------------|:-------------------------------------------------|
| Base ID            | AirTable Base ID                                 |
| Table ID or Name   | Table name or ID                                 |
| Record ID          | Record ID, e.g., `recXXXXXXXXXXXXXX`            |

**Response shape:** `{ id: "recXXX", fields: { ... }, createdTime: "..." }`

---

### ➕ Create Records

Creates one or more records in a table (up to 10 per call).

| Field              | Description                                                                              |
|:-------------------|:-----------------------------------------------------------------------------------------|
| Base ID            | AirTable Base ID                                                                         |
| Table ID or Name   | Table name or ID                                                                         |
| Records            | Single: `{"fields": {"Name": "Alice"}}` or array: `[{"fields": {"Name": "Alice"}}, ...]` |
| Typecast           | Auto-convert string values to the correct field type                                     |

**Response shape:** `{ records: [{ id: "recXXX", fields: { ... } }] }`

---

### ✏️ Update Records

Partially updates (PATCH) one or more existing records. Only the fields you specify are changed.

| Field                  | Description                                                              |
|:-----------------------|:-------------------------------------------------------------------------|
| Base ID                | AirTable Base ID                                                         |
| Table ID or Name       | Table name or ID                                                         |
| Records                | Array with record IDs: `[{"id": "recXXX", "fields": {"Status": "Done"}}]` |
| Perform Upsert         | Create records that do not exist, matched by merge fields                |
| Upsert Match Fields    | Field names for upsert matching, e.g., `["Email"]`                      |
| Typecast               | Auto-convert string values to the correct field type                     |

**Response shape:** `{ records: [{ id: "recXXX", fields: { ... } }] }`

---

### 🗑️ Delete Records

Deletes one or more records by their IDs (max 10 per call).

| Field              | Description                                                       |
|:-------------------|:------------------------------------------------------------------|
| Base ID            | AirTable Base ID                                                  |
| Table ID or Name   | Table name or ID                                                  |
| Record IDs         | Single ID string `"recXXX"` or array `["recXXX", "recYYY"]`      |

**Response shape:** `{ records: [{ id: "recXXX", deleted: true }] }`

---

### 🏗️ List Tables

Retrieves the schema and metadata for all tables in a base — useful for discovery and dynamic flows.

| Field      | Description        |
|:-----------|:-------------------|
| Base ID    | AirTable Base ID   |

**Response shape:** `{ tables: [{ id: "tblXXX", name: "...", fields: [...], views: [...] }] }`

---

## Usage

1. **Create a connection** using your AirTable Personal Access Token.
2. **Add a node** to your flow and select the desired operation.
3. **Provide the Base ID and Table name** — copy the Base ID from the AirTable URL: `airtable.com/{baseId}/{tableIdOrName}`.
4. **Store the response** in Context or Input for downstream flow logic.

---

## Filter Formula Examples

```
{Status} = 'Active'
AND({Age} > 18, {Country} = 'US')
OR({Priority} = 'High', {Priority} = 'Critical')
NOT({Archived})
SEARCH('keyword', {Notes}) != ''
IS_BEFORE({DueDate}, TODAY())
```

---

## Notes

- All nodes store results under the configured **Store Key** in Context or Input.
- Errors are logged and also stored in `context.airtableError` for flow-level handling.
- Batch operations (create/update/delete) support up to **10 records per call** per AirTable API limits.
- For pagination, store the `offset` value from a List Records response and pass it back in the next call.
