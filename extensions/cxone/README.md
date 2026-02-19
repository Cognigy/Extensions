# CXone Extension

This Cognigy extension integrates with **CXone**, providing authenticated HTTP request capabilities for CXone API integration in your Cognigy flows.

## Installation

1. Build the extension:
   ```bash
   npm install
   npm run build
   ```

2. Upload the generated `cxone-*.tar.gz` file to your Cognigy.AI instance via **Manage > Extensions > Upload Extension**

## CXone Authenticated Call Node

Makes authenticated HTTP requests to any API using CXone bearer tokens.

### Features
- Automatic token injection from `input.data.cxonetoken` or `context.cxonetoken`
- Multiple HTTP methods (GET, POST, PUT, PATCH, DELETE)
- JSON, Text, and Form data payload types
- Configurable timeout (1-20 seconds, default 8s)
- Automatic retry with exponential backoff
- Request/response logging with sensitive data redaction
- Response header storage option
- Structured error handling
- Configurable response storage (input or context, custom key)
- Optional insecure SSL support for development environments

### Configuration

#### Basic
- **URL** (`url`): Complete endpoint URL.
- **HTTP Method** (`method`): One of `GET`, `POST`, `PUT`, `PATCH`, `DELETE`.

#### Headers
- **Headers** (`headers`): Additional request headers as JSON object (e.g. `{"X-Custom": "value"}`).  
  The `Authorization` header is injected automatically from the CXone token.
- **Store Response Headers** (`storeResponseHeaders`): When enabled, response headers are stored together with the body in the configured target.

#### Payload
- **Payload Type** (`payloadType`): Selects how to send the request body for non-DELETE methods (including GET with body for complex queries):
  - `json`: uses **Request Body (JSON)**.
  - `text`: uses **Request Body (Text)**.
  - `form`: uses **Request Body (Form Data)**.

  **Note**: While GET requests with body data are non-standard HTTP practice, some APIs require complex query parameters that are better suited to request bodies.
- **Request Body (JSON)** (`bodyJson`): JSON object body (e.g. `{"foo": "bar"}`).
- **Request Body (Text)** (`bodyText`): Raw text body.
- **Request Body (Form Data)** (`bodyForm`): JSON object treated as key/value pairs for form data.

#### Execution
- **Timeout (ms)** (`timeoutMs`): Request timeout in milliseconds (1,000–20,000). There is still a hard 20s execution budget in Cognigy.
- **Enable Retry** (`enableRetry`): When enabled, the node automatically retries on network errors, timeouts and server errors.
- **Retry Attempts** (`retryAttempts`): Number of additional retries (1–5). `2` means `1 initial + 2 retries = 3` total attempts. Uses exponential backoff with jitter.

#### Error handling & debug
- **Fail on Non-2xx Status** (`failOnNon2xx`):  
  - `true` (default): non-2xx responses are treated as errors and surfaced via structured error objects.  
  - `false`: non-2xx responses are treated as successful and returned with status and body.
- **Debug Mode** (`debugMode`): Enables detailed logging of request/response metadata. Sensitive values such as tokens and credentials are redacted.

#### Security
- **Allow Insecure SSL** (`allowInsecureSSL`):  
  Allows calls to HTTPS endpoints with self-signed or otherwise untrusted certificates.  
  **Use only in development/testing**, never in production.

#### Storage
- **Store Result In** (`responseTarget`): Where to store the response (`context` or `input`). Default is `context`.
- **Key to store Result** (`responseKey`): Path/key used under the selected target (default: `cxoneApiResponse`).

Example: with default storage, a successful call will store the result in `context.cxoneApiResponse`.

### Example usage

```json
{
  "url": "https://api.cxone.example.com/v1/customers",
  "method": "GET",
  "headers": {
    "X-Tenant": "my-tenant"
  },
  "timeoutMs": 8000,
  "enableRetry": true,
  "retryAttempts": 2,
  "responseTarget": "context",
  "responseKey": "cxoneApiResponse",
  "failOnNon2xx": true,
  "debugMode": false
}
```

In the flow, you can then read the response from `context.cxoneApiResponse`.

## Testing

This extension uses **Jest** for unit tests.

- **Run all tests**: `npm test`
- **Run tests in watch mode**: `npm run test:watch`

The test suite covers:
- Node descriptors in `src/nodes` (`authenticated-call.ts`) including success and error paths
- Helpers in `src/helpers` (`errors.ts`) to verify error handling and response formatting
- Jest is configured with coverage thresholds targeting near-100% coverage for helper modules

## Troubleshooting

### Common Issues

**Error: "Missing cxonetoken"**
- Ensure the flow is invoked by CXone with authentication token in `input.data.cxonetoken` or `context.cxonetoken`

**HTTP Error responses**
- Check the endpoint URL is correct and accessible
- Verify the HTTP method matches the API requirements
- Ensure request headers are properly formatted JSON

**Timeout errors**
- Increase the timeout value in node configuration (max 20 seconds)
- Check network connectivity to the target API

**Retry exhaustion**
- Check server availability and response times
- Verify API endpoint is not rate-limiting requests

## Development

### Building

```bash
npm install
npm run transpile
npm run lint
npm run build  # Includes transpile, lint, and zip
```

### Project Structure

```
src/
├── nodes/           # Node implementations (authenticated-call)
├── helpers/         # Utility functions (errors)
├── test-utils/      # Test utilities and mocks
└── types/           # TypeScript type definitions
```

## License

NiCE

## Author

NiCE
