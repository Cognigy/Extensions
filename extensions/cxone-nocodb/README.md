# NocoDB

This Cognigy extension integrates with **NocoDB**, enabling full record management from your Cognigy flows via the NocoDB REST API v2.

---

## Connection

Create a **NocoDB Connection** with two fields:

| Field          | Description                                                                  |
|:---------------|:-----------------------------------------------------------------------------|
| serverUrl      | Base URL of your NocoDB instance, e.g., `https://nocodb.example.com`        |
| apiToken       | API token from NocoDB → Team & Settings → API Tokens                        |

---

## Nodes

### 📋 List Records

Retrieves records from a table with optional filtering, sorting, and pagination.

| Field                | Description                                                                         |
|:---------------------|:------------------------------------------------------------------------------------|
| Table ID             | NocoDB table ID, e.g., `md_xxxxxxxxxxxx`                                            |
| Filter (where)       | NocoDB filter expression, e.g., `(Status,eq,Active)~and(Age,gt,18)`                |
| Sort Field           | Field name to sort by                                                               |
| Sort Direction       | Ascending or Descending                                                             |
| Return Fields        | Comma-separated field names to include, e.g., `Name,Status,Email`                  |
| Limit                | Number of records per page (default 25)                                             |
| Offset               | Number of records to skip for pagination (default 0)                                |

**Response shape:** `{ list: [...], pageInfo: { totalRows, page, pageSize, isFirstPage, isLastPage } }`

---

### 🔍 Get Record

Retrieves a single record by its row ID.

| Field        | Description                                          |
|:-------------|:-----------------------------------------------------|
| Table ID     | NocoDB table ID                                      |
| Row ID       | Primary key value of the row, e.g., `1`              |

**Response shape:** `{ Id: 1, Name: "Alice", Status: "Active", ... }`

---

### ➕ Create Records

Creates one or more records in a table.

| Field        | Description                                                                                      |
|:-------------|:-------------------------------------------------------------------------------------------------|
| Table ID     | NocoDB table ID                                                                                  |
| Records      | Single record: `{"Name": "Alice"}` or array: `[{"Name": "Alice"}, {"Name": "Bob"}]`             |

**Response shape:** created record object or array of created records.

---

### ✏️ Update Records

Updates one or more existing records. Each record must include its `Id` field.

| Field        | Description                                                                                      |
|:-------------|:-------------------------------------------------------------------------------------------------|
| Table ID     | NocoDB table ID                                                                                  |
| Records      | Single: `{"Id": 1, "Status": "Done"}` or array: `[{"Id": 1, "Status": "Done"}, ...]`            |

**Response shape:** updated record object or array of updated records.

---

### 🗑️ Delete Records

Deletes one or more records by their row IDs.

| Field          | Description                                                        |
|:---------------|:-------------------------------------------------------------------|
| Table ID       | NocoDB table ID                                                    |
| Record IDs     | Single ID: `1` or array: `[1, 2, 3]`                              |

**Response shape:** `1` (number of deleted rows) or array confirmation.

---

### 🏗️ List Tables

Retrieves metadata for all tables in a NocoDB base — useful for discovery and dynamic flows.

| Field      | Description                                              |
|:-----------|:---------------------------------------------------------|
| Base ID    | NocoDB base (project) ID, e.g., `p_xxxxxxxxxxxx`         |

**Response shape:** `{ list: [{ id: "md_xxx", title: "...", columns: [...] }], ... }`

---

## Usage

1. **Create a connection** with your NocoDB server URL and API token.
2. **Find your Table ID** — open the table in NocoDB and copy the ID from the URL or via the List Tables node.
3. **Add a node** to your flow and select the desired operation.
4. **Store the response** in Context or Input for downstream flow logic.

---

## Filter Expression Examples

```
(Status,eq,Active)
(Age,gt,18)~and(Country,eq,US)
(Priority,eq,High)~or(Priority,eq,Critical)
(Name,like,%Alice%)
(CreatedAt,gte,2024-01-01)
```

**Supported operators:** `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `like`, `nlike`, `is`, `isnot`, `in`, `btw`, `nbtw`

---

## Notes

- All nodes store results under the configured **Store Key** in Context or Input.
- Errors are logged and also stored in `context.nocodbError` for flow-level handling.
- For pagination, use `offset` with `limit` to page through results. The `pageInfo.isLastPage` field indicates when you have reached the end.
- Table IDs (`md_xxx`) and Base IDs (`p_xxx`) are visible in the NocoDB URL when viewing a table or base.
