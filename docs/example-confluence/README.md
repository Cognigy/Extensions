# Example Extension

This is a sample extension designed to help you get started with Cognigy.AI Knowledge Connector Extensions. It allows you to connect to Confluence and retrieve data from its pages or folders.

The extension uses the [turndown](https://www.npmjs.com/package/turndown/v/4.0.0-rc.1) npm package to convert the content returned by Confluence into Markdown format. With Turndown, you can customize or extend the handling of HTML tags by adding your own rules.

### Heading-Based Chunking
Content is automatically divided into chunks based on the heading hierarchy and the target heading level defined by TARGET_HEADING_LEVEL. For example, if TARGET_HEADING_LEVEL = 2, the chunking behavior will be as follows:
- **H1, H2**: Start new chunks
- **H3, H4, H5, H6**: Included in the current chunk

### Supported Content Types
- Plain text and formatted text
- Tables
- Bulleted and numbered lists
- Panels (info, warning, error, success)
- Expandable sections
- Task lists and decisions
- Images (alt text extracted)
- Internal and external links

----
**Connection: apiKeyConnection**

[Connection](https://docs.cognigy.com/docs/connections) can be used to handle API credentials.

This example Connection only requires you to fill out two fields:
- Email: Your Confluence account email
- Api-Token: The API token from confluence

----
**Fields:**

#### Connection
Select the pre-configured connection containing your Confluence credentials, or create a new one

#### Confluence URL
URL of the Confluence page or folder

#### Extract Descendants
This field is only relevant if the Confluence URL is of a page. In case it's of a folder, all the pages under the folder are extracted.

#### Source Tags
Sets the tags that you want to associate with each knowledge source
