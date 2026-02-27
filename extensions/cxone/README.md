# CXone Extension

This Cognigy extension integrates with **CXone**, enabling transcript posting, live agent transfers, and signaling interactions for voice and chat channels in your Cognigy flows.

## Prerequisites

- A CXone account with API access
- CXone connection credentials:
  - Environment URL (e.g., `https://cxone.niceincontact.com`)
  - Access Key ID and Access Key Secret
  - Client ID and Client Secret

## Installation

1. Build the extension:
   ```bash
   npm install
   npm run build
   ```

2. Upload the generated `cxone-*.tar.gz` file to your Cognigy.AI instance via **Manage > Extensions > Upload Extension**

3. Create a CXone connection in Cognigy.AI with your credentials

## Connection Configuration

**CXone Connection**

To use the CXone extension, you need to create a connection:

1. Navigate to **Manage > Connections**
2. Click the `+` button and select **CXone Connection**
3. Fill in the required fields:

| Field | Description |
|-------|-------------|
| Environment URL | The CXone environment base URL (e.g., `https://cxone.niceincontact.com`) |
| Access Key ID | Your CXone Access Key ID for API authentication |
| Access Key Secret | Your CXone Access Key Secret |
| Client ID | Your CXone Client ID for OAuth authentication |
| Client Secret | Your CXone Client Secret |

## Nodes

### Exit Interaction

The **Exit Interaction** node allows you to send **End** or **Escalate** signals to the **CXone API** in the Voice channel (either to end a conversation or escalate it to a live agent), or to send a structured data message to Studio in the CXone Guide Chat channel via TextBotExchange.

For **voice interactions**, it also posts the conversation transcript to the **Transcript Management System (TMS)** if a transcript is available in the flow context.

The node **waits for 5 seconds before returning control** to the Cognigy flow to avoid unwanted messages or interference during the handover process.

#### Features

- **Send signals to CXone API in Voice channel**:
  - Escalate a conversation to a live agent
  - End a conversation
- **Post conversation transcripts in Voice channel** to **TMS** (if a transcript is available)
- **Return `Intent` (`Escalate` or `End`) in CXone Guide Chat channel** to Studio
- **Handle optional parameters**:
  - Optional parameters can be provided as an array of JSON objects:
    - In **voice interactions**, these are sent as P2 in the signal
    - In **NiCE Guide Chat**, these are returned to Studio as a serialized JSON string

#### Channel Behavior

- **Voice**
  - Signal is sent to CXone Studio
  - **Exit Action** becomes P1
  - **Optional parameters** become P2
  - Transcript is optionally sent to TMS
  - No output is returned from the node

- **NiCE Guide Chat**
  - Returns a structured object to Studio in the following format:

    ```json
    {
      "_cognigy": {
        "_niceCXOne": {
          "json": {
            "text": "",
            "uiComponent": {},
            "data": {
              "Intent": "Escalate",
              "Params": "[{\"key\":\"value\"}]"
            },
            "action": "AGENT_TRANSFER"
          }
        }
      }
    }
    ```

- **Webchat / Testchat**
  - Does not signal or return any data

#### Configuration Fields

- **CXone Connection** (required): Select the CXone connection to use
- **Exit Action** (required): Choose "Escalate to Agent" or "End Conversation"
- **Business Unit Number** (required): The CXone Business Unit Number
- **Main Contact ID** (required): The CXone Main Contact ID
- **Spawned Contact ID** (required): The CXone Spawned Contact ID
- **Parameters (optional)**: Array of JSON objects to be sent to CXone

---

### Signal Interaction

The **Signal Interaction** node allows you to send custom signals to the **CXone API** using parameters of your choice.

#### Features

- Handles authentication by obtaining a **CXone bearer token** via your connection credentials
- Sends a signal request to the **CXone API** with the configured parameters
- Parameters are automatically named `p1`, `p2`, `p3`, etc., according to their order in the configuration
- Returns data to Studio: `{"Intent":"Signal", "Params":"p1|p2|p3"}`

#### Configuration Fields

- **CXone Connection** (required): Select the CXone connection to use
- **Contact ID** (required): The CXone Contact ID
- **Signal Parameters** (required): Array of strings representing the signal parameters

#### Usage

1. Configure your CXone connection
2. Provide the Contact ID for the interaction
3. Specify signal parameters as an array of strings (e.g., `["param1", "param2", "param3"]`)
4. The node will automatically authenticate and send the signal to CXone

---

## Testing

This extension uses **Jest** for unit tests.

- **Run all tests**: `npm test`
- **Run tests in watch mode**: `npm run test:watch`

The test suite covers:
- Node descriptors in `src/nodes` (e.g., `handover.ts`, `send-signal.ts`) including success and error paths
- Helpers in `src/helpers` (all HTTP helpers and `tms-payload.ts`) to verify request formats and error handling
- Jest is configured with coverage thresholds targeting near-100% coverage for helper modules

## Troubleshooting

### Common Issues

**Error: "CXone API Connection not found"**
- Ensure you have created and selected a CXone connection in the node configuration

**Error: "Environment URL is required in connection configuration"**
- Verify your connection has a valid Environment URL configured

**Error: "Error getting bearer token"**
- Check that your Client ID and Client Secret are correct
- Verify your Access Key ID and Access Key Secret are valid
- Ensure your CXone account has API access enabled

**Token caching issues**
- Tokens are cached in context for up to 50 minutes
- If you encounter authentication errors, the token will be automatically refreshed

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
├── connections/     # Connection schemas
├── nodes/           # Node implementations
├── helpers/         # Utility functions
├── api/             # API client (to be created)
├── utils/           # Utility modules (to be created)
├── config/          # Configuration constants (to be created)
└── types/           # TypeScript type definitions (to be created)
```

## License

NiCE

## Author

NiCE
