# HubSpot Extension for Cognigy.AI
**Version: 4.2.0**

Integrates Cognigy.AI with HubSpot CRM (https://www.hubspot.com)

This extension is based on the official HubSpot API Client (@hubspot/api-client) and provides comprehensive CRM integration capabilities for Cognigy.AI flows.

## Table of Contents
- [Connection Setup](#connection-setup)
- [Error Handling](#error-handling) 
- [Node Documentation](#node-documentation)
- [Property Guidelines](#property-guidelines)
- [Troubleshooting](#troubleshooting)
- [Version History](#version-history)

---

## Connection Setup

This extension requires a Connection using an access token from a [HubSpot Private App](https://developers.hubspot.com/docs/api/private-apps):

### Creating the Connection:
1. **Connection Type**: `hubspot`
2. **Field Name**: `accessToken`
3. **Value**: Your HubSpot Private App Access Token

### Required HubSpot Scopes:
Ensure your Private App has these scopes enabled:
- `crm.objects.contacts.read` and `crm.objects.contacts.write`
- `crm.objects.companies.read` and `crm.objects.companies.write`
- `crm.objects.tickets.read` and `crm.objects.tickets.write`
- `crm.objects.notes.read` and `crm.objects.notes.write`
- `crm.objects.tasks.read` and `crm.objects.tasks.write`
- `crm.objects.calls.read` and `crm.objects.calls.write`
- `crm.objects.emails.read` and `crm.objects.emails.write`
- `crm.objects.meetings.read` and `crm.objects.meetings.write`
- `crm.associations.read` and `crm.associations.write`

---

## Error Handling

All nodes implement comprehensive error handling designed to **continue flow execution** while providing detailed error information.

### Error Behavior:
- **✅ Errors do NOT stop flows** - They set context variables and allow execution to continue
- **✅ Detailed error information** - Available in `context.error`
- **✅ Success indicators** - `context.success` shows operation status
- **✅ Graceful association failures** - Main operations succeed even if associations fail

### Standard Error Context Variables:
All nodes set these standard variables:

| Variable | Type | Description |
|----------|------|-------------|
| `context.success` | Boolean | `true` if operation succeeded, `false` if failed |
| `context.error` | String | Error message details (only set when `success` is `false`) |

### Controlling Flow with Errors:

Since errors don't automatically stop flows, use conditional logic:

**Example 1: If/Else Node**
```
[HubSpot Node] → [If Node: {{context.success}}]
                    ├─ TRUE: "Operation successful"
                    └─ FALSE: "Error: {{context.error}}"
```

**Example 2: Conditional Say Node**
```handlebars
{{#if context.success}}
Contact found: {{context.contactId}}
{{else}}
Search failed: {{context.error}}
{{/if}}
```

**Example 3: Stop Flow on Error**
Add a Stop Flow node with:
- **Condition**: `!context.success`
- **Stop Reason**: `{{context.error}}`

---

## Node Documentation

### Find Entity

**Universal search node** that finds contacts, companies, or tickets in HubSpot using flexible search criteria.

**Fields:**
- **Connection** (required): HubSpot connection
- **Entity Type** (required): Contact, Company, or Ticket
- **Search Field** (required): Property to search by (varies by entity type)
- **Search Value** (required): Value to search for
- **Properties to Return**: Comma-separated list of properties to return
- **Result Limit**: Maximum number of results (1-100, default: 10)
- **Storage Options**: Where to store results (Input/Context)

**Search Fields by Entity Type:**

**Contact Search Fields:**
- `email`, `firstname`, `lastname`, `phone`, `mobilephone`
- `company`, `jobtitle`, `website`, `city`, `state`
- `country`, `zip`, `hs_lead_status`, `lifecyclestage`
- `hubspot_owner_id`, `hs_object_id`

**Company Search Fields:**
- `name`, `domain`, `phone`, `industry`, `city`
- `state`, `country`, `zip`, `website`, `type`
- `hubspot_owner_id`, `hs_object_id`

**Ticket Search Fields:**
- `subject`, `hs_pipeline`, `hs_pipeline_stage`, `hs_ticket_priority`
- `hs_ticket_category`, `source_type`, `hubspot_owner_id`, `hs_object_id`

**Default Properties Returned:**
- **Contacts**: `email,firstname,lastname,phone,company,city,state,country`
- **Companies**: `name,domain,phone,industry,city,state,country,website`
- **Tickets**: `subject,hs_pipeline,hs_pipeline_stage,hs_ticket_priority,hs_ticket_category,source_type,createdate,hs_lastmodifieddate`

**Returns:**
```javascript
context.findEntity          // Array of matching entities
context.findEntityCount     // Number of entities found
context.entityType          // Type of entity searched
context.success            // Operation success status
```

**Example Usage:**
- Find contact by email: Entity Type=`Contact`, Search Field=`email`, Search Value=`john@example.com`
- Find company by domain: Entity Type=`Company`, Search Field=`domain`, Search Value=`example.com`
- Find high priority tickets: Entity Type=`Ticket`, Search Field=`hs_ticket_priority`, Search Value=`HIGH`

---

### Update Entity

**Universal update node** that updates contacts, companies, or tickets in HubSpot.

**Fields:**
- **Connection** (required): HubSpot connection
- **Entity Type** (required): Contact, Company, or Ticket
- **Entity ID** (required): HubSpot ID of the entity to update
- **Properties to Update** (required): JSON object with properties to update
- **Storage Options**: Where to store results (Input/Context)

**Properties Format by Entity Type:**

**Contact Update:**
```json
{
  "firstname": "Jane",
  "lastname": "Smith", 
  "phone": "+1-555-987-6543",
  "jobtitle": "Senior Sales Manager",
  "lifecyclestage": "customer"
}
```

**Company Update:**
```json
{
  "name": "Updated Company Name",
  "industry": "COMPUTER_SOFTWARE",
  "city": "New York",
  "type": "PROSPECT"
}
```

**Ticket Update:**
```json
{
  "hs_pipeline_stage": "3",
  "hs_ticket_priority": "LOW", 
  "subject": "Updated: Issue Resolved",
  "content": "Customer's login issue has been resolved"
}
```

**Returns:**
```javascript
context.updateEntity        // Entity ID that was updated
context.success            // Operation success status
context.entityType         // Type of entity updated
context.contactData        // Full contact object (for contacts)
context.companyData        // Full company object (for companies)
context.ticketData         // Full ticket object (for tickets)
```

**Example Usage:**
- Update contact from Find Entity: Entity Type=`Contact`, Entity ID=`{{context.findEntity[0].id}}`
- Update company status: Entity Type=`Company`, Entity ID=`12345`, Properties=`{"type": "CUSTOMER"}`

---

### Create Contact

Creates a new contact in HubSpot.

**Fields:**
- **Connection** (required): HubSpot connection
- **Contact Properties** (required): JSON object with contact properties

**Properties Format:**
```json
{
  "firstname": "John",
  "lastname": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1-555-123-4567",
  "company": "Example Corp",
  "jobtitle": "Sales Manager"
}
```

**Returns:**
```javascript
context.contact     // Full contact object
context.contactId   // New contact ID
context.success     // Operation success status
```

---

### Create Company

Creates a new company in HubSpot.

**Fields:**
- **Connection** (required): HubSpot connection
- **Company Properties** (required): JSON object with company properties

**Properties Format:**
```json
{
  "name": "Example Corporation",
  "domain": "example.com",
  "industry": "COMPUTER_SOFTWARE",
  "city": "San Francisco",
  "state": "California",
  "country": "United States",
  "type": "PROSPECT"
}
```

**Important Industry Values:**
Use HubSpot's predefined industry values like:
- `COMPUTER_SOFTWARE`, `FINANCIAL_SERVICES`, `MANUFACTURING`
- `HEALTHCARE`, `RETAIL`, `EDUCATION`, `CONSULTING`
- `REAL_ESTATE`, `TELECOMMUNICATIONS`, `TRANSPORTATION`

**Important Type Values**:
- `PROSPECT`, `PARTNER`, `VENDOR`, `OTHER`

**Returns:**
```javascript
context.company     // Full company object
context.companyId   // New company ID
context.success     // Operation success status
```

---

### Create Ticket

Creates a new ticket in HubSpot with optional contact association and configurable result storage.

**Fields:**
- **Connection** (required): HubSpot connection
- **Ticket Properties** (required): JSON object with ticket properties
- **Contact ID** (optional): HubSpot Contact ID to associate the ticket with
- **Storage Options**: Configure where to store the ticket ID
  - **Store Location**: Input or Context
  - **Input Key / Context Key**: Custom key name for storing the ticket ID

**Ticket Properties Format:**
```json
{
  "hs_pipeline": "0",
  "hs_pipeline_stage": "1", 
  "hs_ticket_priority": "HIGH",
  "subject": "Customer Support Request",
  "content": "Customer is experiencing login issues"
}
```

**Contact Association:**
To associate with a contact from Find Entity:
```
Contact ID: {{context.findEntity[0].id}}
```

**Returns:**
```javascript
context.ticketData              // Full ticket object
context.success                 // Operation success status
[custom_key]                   // Ticket ID stored in specified location
```

**Note:** If contact association fails, the ticket is still created successfully and a warning is logged.

---

### Create Engagement

Creates engagements (Notes, Tasks, Calls, Emails, Meetings) in HubSpot with optional associations to contacts and companies.

**Fields:**
- **Connection** (required): HubSpot connection
- **Engagement Type** (required): Type of engagement to create
- **Engagement Properties** (required): JSON object with engagement-specific properties
- **Contact IDs** (optional): Comma-separated list of Contact IDs to associate
- **Company IDs** (optional): Comma-separated list of Company IDs to associate

**Engagement Types & Required Properties:**

**Task:**
```json
{
  "hs_task_subject": "Follow up with customer",
  "hs_task_body": "Call customer to discuss renewal",
  "hs_task_priority": "HIGH",
  "hs_timestamp": 1749682189000,
  "hs_task_status": "NOT_STARTED"
}
```

**Note:**
```json
{
  "hs_note_body": "Customer expressed interest in our premium features during the call"
}
```

**Call:**
```json
{
  "hs_call_title": "Discovery Call",
  "hs_call_body": "Discussed customer requirements and pricing",
  "hs_timestamp": 1749682189000
}
```

**Email:**
```json
{
  "hs_email_subject": "Follow-up Information",
  "hs_email_text": "Thank you for your time today. Here are the materials we discussed..."
}
```

**Meeting:**
```json
{
  "hs_meeting_title": "Product Demo",
  "hs_meeting_body": "Demonstrated key features and answered technical questions"
}
```

**Association Examples:**
- **Contact IDs**: `{{context.findEntity[0].id}}` or `123456,789012,345678`
- **Company IDs**: `987654,543210`

**Returns:**
```javascript
context.engagement      // Full engagement object
context.engagementId    // New engagement ID
context.engagementType  // Type of engagement created
context.success         // Operation success status
```

**Association Behavior:**
- Main engagement creation succeeds independently
- Association failures are logged as warnings but don't fail the operation
- `context.success` remains `true` for successful engagement creation

---

## Property Guidelines

### HubSpot Property Names
- Use exact HubSpot property names (case-sensitive)
- Standard properties: `firstname`, `lastname`, `email`, `phone`, `company`
- Custom properties: Use the internal name from HubSpot (e.g., `custom_field_123`)

### Property Value Formats
- **Text fields**: Use strings
- **Numbers**: Use numeric values without quotes
- **Dates**: Use ISO 8601 format (`2025-06-11T22:49:49Z`) or Unix timestamp in milliseconds
- **Booleans**: Use `true`/`false` or `"true"`/`"false"`

### Industry and Type Values
**Company Industry Values** (use exact values):
- `COMPUTER_SOFTWARE`, `FINANCIAL_SERVICES`, `MANUFACTURING`
- `HEALTHCARE`, `RETAIL`, `EDUCATION`, `CONSULTING`
- `REAL_ESTATE`, `TELECOMMUNICATIONS`, `TRANSPORTATION`

**Company Type Values**:
- `PROSPECT`, `PARTNER`, `VENDOR`, `OTHER`

### Required vs Optional Properties
- Check HubSpot documentation for required fields
- Tasks require: `hs_task_subject` and `hs_timestamp`
- Contacts require: `email` (in most cases)
- Tickets require: Pipeline and stage information
- Companies require: `name` (minimum)

### Dynamic Property Values
Use Cognigy Script for dynamic values:
```json
{
  "firstname": "{{input.firstname}}",
  "lastname": "{{context.customerName}}",
  "phone": "{{input.aiAgentOutput.toolCalls[0].function.arguments.phoneNumber}}"
}
```

---

## Troubleshooting

### Common Issues and Solutions

**1. "Authentication credentials not provided"**
- **Cause**: Invalid or missing HubSpot access token
- **Solution**: 
  - Verify your Private App access token in the connection
  - Check that the token hasn't expired
  - Ensure the token has required scopes

**2. "Property does not exist"**
- **Cause**: Using incorrect property names
- **Solution**:
  - Use exact HubSpot property names (case-sensitive)
  - Check property names in HubSpot Settings > Properties
  - Custom properties may have different internal names

**3. "Some required properties were not set"**
- **Cause**: Missing required HubSpot properties
- **Solution**:
  - Check HubSpot API documentation for required fields
  - For tasks: Ensure `hs_task_subject` and `hs_timestamp` are included
  - For tickets: Include pipeline and stage information

**4. "Invalid industry/type value"**
- **Cause**: Using incorrect enum values for industry or type fields
- **Solution**:
  - Use predefined HubSpot values (see Property Guidelines)
  - For companies: Use `COMPUTER_SOFTWARE` not `Technology`
  - For company type: Use `PROSPECT`, `PARTNER`, `VENDOR`, or `OTHER`

**5. "Rate limit exceeded"**
- **Cause**: Too many API calls in a short period
- **Solution**:
  - Add delays between multiple HubSpot operations
  - Use batch operations when possible
  - Monitor API usage in HubSpot developer dashboard

**6. Search returns no results**
- **Cause**: Search criteria don't match existing data
- **Solution**:
  - Verify search values match data exactly (case-sensitive)
  - Check that entities exist in the correct HubSpot portal
  - Use Find Entity to verify data before updates

**7. Association failures**
- **Cause**: Invalid contact/company IDs or permission issues
- **Solution**:
  - Verify IDs exist: Use Find Entity to get valid IDs
  - Check access token has association permissions
  - Review Cognigy logs for specific association error details

**8. Invalid timestamp formats**
- **Cause**: Incorrect date/time format for HubSpot
- **Solution**:
  - Use Unix timestamp in milliseconds: `1749682189000`
  - Or ISO 8601 format: `2025-06-11T22:49:49Z`
  - For Cognigy variables: `{{currentTime.milliseconds}}`

### Debug Strategies

**1. Check Error Context**
Always verify `context.success` and `context.error`:
```handlebars
Success: {{context.success}}
{{#unless context.success}}
Error: {{context.error}}
{{/unless}}
```

**2. Use Find Entity First**
Before updating/creating associations, use Find Entity to verify IDs:
```
[Find Entity] → [Update Entity with {{context.findEntity[0].id}}]
```

**3. Test with Minimal Properties**
Start with basic required properties, then add optional fields:
```json
{
  "hs_task_subject": "Test Task",
  "hs_timestamp": 1749682189000
}
```

**4. Check HubSpot Logs**
- Review Cognigy execution logs for warnings
- Check HubSpot developer dashboard for API usage and errors
- Association failures appear as warnings, not errors

### Performance Considerations

- **Batch Operations**: Group multiple operations when possible
- **Rate Limits**: HubSpot has different limits for different endpoints
- **Search Optimization**: Use specific search criteria to reduce result sets
- **Caching**: Store frequently used contact/company IDs in context
- **Error Recovery**: Design flows to handle partial failures gracefully

---

## Version History

### Version 4.2.0 (Current)
**Major Updates:**
- **New Find Entity Node**: 
  - Universal search for contacts, companies, and tickets
  - 15+ searchable properties per entity type
  - Configurable result limits and property selection
  - Replaces the old Find Contact node with expanded functionality
- **New Update Entity Node**: 
  - Universal update for contacts, companies, and tickets
  - Consolidated update functionality in a single node
  - Proper error handling and result storage
- **Enhanced Error Handling**: All nodes now provide consistent error reporting
- **Improved Property Validation**: Better handling of HubSpot enum values
- **API Modernization**: Updated to latest HubSpot API patterns

**Node Changes:**
- **Added**: Find Entity (replaces Find Contact)
- **Added**: Update Entity (consolidates update functionality)
- **Enhanced**: All existing nodes with better error handling
- **Removed**: Old Find Contact, Update Contact, Update Company, Update Ticket nodes

### Version 4.1.0
**Major Updates:**
- **Enhanced Find Contact Node**: 
  - 17 searchable properties (email, phone, company, address fields, etc.)
  - 9 search operators (equals, contains, greater than, etc.)
  - Configurable storage options (Input/Context with custom keys)
- **Create Ticket with Association**: Contact association and storage options
- **Modern HubSpot API**: Updated to official `@hubspot/api-client` v10+
- **Comprehensive Error Handling**: Graceful failures with detailed error context
- **Create Engagement**: Support for all engagement types (Notes, Tasks, Calls, Emails, Meetings)
- **Advanced Associations**: Automatic linking of engagements to contacts and companies

### Previous Versions
- **Version 4.0.0**: Basic HubSpot integration with legacy API
- **Earlier versions**: Limited functionality with older HubSpot API

---

## Support and Resources

- **HubSpot API Documentation**: https://developers.hubspot.com/docs/overview
- **Cognigy Extension Development**: https://docs.cognigy.com/ai/build/extensions/
- **HubSpot Private Apps**: https://developers.hubspot.com/docs/api/private-apps
- **Property Reference**: Check your HubSpot portal under Settings > Properties

For extension-specific issues, check `context.error` messages and Cognigy execution logs for detailed troubleshooting information.