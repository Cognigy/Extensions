# Workflow Completion Extension

This Cognigy extension provides workflow completion tracking capabilities for your Cognigy flows, allowing you to mark workflows as completed or failed while capturing session metrics.

## Installation

1. Build the extension:
   ```bash
   npm install
   npm run build
   ```

2. Upload the generated `workflow-completion-*.tar.gz` file to your Cognigy.AI instance via **Manage > Extensions > Upload Extension**

## Workflow Completion Node

A terminal node that marks workflow completion status and captures session metrics.

### Features
- Simple dropdown to mark workflow as "Completed" or "Failed"
- Captures session metrics (when available)
- Designed as a terminal node for end-of-flow placement
- Outputs structured data for analytics and reporting
- Silent execution with empty say() message

### Configuration

#### Status Selection
- **Completion Status** (`status`): Dropdown selection between:
  - `Completed` (default): Marks the workflow as successfully completed
  - `Failed`: Marks the workflow as failed or incomplete

### Output

The node outputs data in the following structure:

```json
{
  "status": "Completed", // or "Failed"
  "metrics": {
    // Session metrics when available:
    // - sessionId: Unique session identifier
    // - conversationDuration: Time spent in conversation (ms)
    // - inputCount: Number of user inputs
    // - responseCount: Number of bot responses
    // - stepCount: Number of flow steps executed
    // Empty object {} if metrics are not accessible
  }
}
```

### Example Usage

1. Place the **Workflow Completion** node at the end of your successful flow path
2. Select "Completed" from the dropdown
3. The node will execute `say("")` (empty message) and output completion data

For error handling paths:
1. Place another **Workflow Completion** node at the end of error flows
2. Select "Failed" from the dropdown
3. Use the output data for failure tracking and analytics

### Use Cases

- **Analytics and Reporting**: Track completion rates across different workflows
- **Performance Monitoring**: Measure session duration and interaction counts
- **Quality Assurance**: Identify failed workflow paths for improvement
- **Business Intelligence**: Export completion data for business metrics
- **A/B Testing**: Compare completion rates between different flow versions

## Testing

This extension uses **Jest** for unit tests.

- **Run all tests**: `npm test`
- **Run tests in watch mode**: `npm run test:watch`

## Troubleshooting

### Common Issues

**Node not appearing in palette**
- Ensure the extension was properly uploaded and enabled
- Check that the extension build completed without errors

**Missing metrics data**
- Some metrics may not be available in all Cognigy environments
- The metrics object will be empty `{}` if session data is not accessible

**Workflow not terminating**
- Ensure the Workflow Completion node is connected as the final node
- Check that no other nodes follow the completion node

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
├── nodes/           # Node implementations (workflowCompletion)
├── test-utils/      # Test utilities and mocks
└── types/           # TypeScript type definitions
```

## License

NiCE

## Author

NiCE