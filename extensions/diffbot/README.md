
# Diffbot

This extension provides two basic Diffbot connectors to enables integration between Cognigy.AI and Diffbot:
- One that crawls through web pages and creates knowledge sources with content chunks.
- Another that accepts webpage URL(s) and generates knowledge sources directly.

## Table of Contents
- [Diffbot Knowledge Connectors](#diffbot-knowledge-connectors)
- [Diffbot Connection](#diffbot-connection)

---
# Diffbot Knowledge Connectors

The Diffbot Knowledge Connector enables extraction of structured data from web pages in JSON format.

### Chunking
The JSON content returned by Diffbot is flattened and processed using recursive character splitting to create text chunks. Each chunk is prefixed with the page title, content type, and URL for web page.

## Knowledge Connector: Diffbot Crawler
Diffbot Crawler automatically creates knowledge sources by crawling web pages from the root page and process their content through Diffbot's extraction service.
See diffbot [Crawler](https://docs.diffbot.com/reference/crawl-introduction) documentation. The user can also monitor running crawler on [Diffbot dashboard](https://app.diffbot.com/crawls/)

### Fields

**Connection:**
Connection field as defined in [Connection](#diffbot-connection)

**Seed URLs:**
Crawling will start from these URLs. Enter one URL per line or entry.

**API URL Type:**
Type of Extract API to call i.e. Product, List etc. If type is not known then choose 'Analyze', however the quality of the result may degrade if 'Analyze' type is chosen. Available options:
- Analyze
- Product
- Article
- Event
- List
- Video
- Image
- Discussion
- FAQ
- Organization

**Query String:**
Query parameters to be passed to Extract API, e.g. fields=title,text

**Retain Crawler:**
Whether to retain the crawler after the crawling operation, the undeleted crawlers can be seen on Diffbot dashboard.

#### Crawling Limits

**Crawling Patterns:**
Only crawl URLs that contain any of these text strings.

**URL Crawling Regex:**
Only crawl URLs matching the regular expression.

**Max to Crawl:**
Maximum number of pages to crawl. (Default: 100)

**Max to Crawl Per Subdomain:**
Maximum number of pages to crawl per subdomain. (Default: -1 for unlimited)

**Max Hops:**
Maximum number of hops away from a seed URL. Set to -1 for unlimited hops. (Default: -1)

**Crawl Delay:**
Number of seconds to wait between requests to the same server. (Default: 0.25)

**Obey Robots:**
Whether to obey robots.txt rules of the website. (Default: true)

**Restrict Domain:**
Limit crawling to seed domains. (Default: true)

**Restrict Subdomain:**
Limit crawling to seed subdomains. (Default: false)

**Use Proxies:**
Whether to use Diffbot's proxy servers for crawling. (Default: false)

**Canonical Deduplication:**
Whether to skip pages with a differing canonical URL. (Default: true)

#### Processing Limits

**Processing Patterns:**
Only process URLs that contain any of these text strings.

**URL Processing Regex:**
Only process URLs matching the regular expression.

**HTML Processing Patterns:**
Only process pages that contain any of these text strings in the HTML.

**Max to Process:**
Maximum number of pages to process. (Default: 100)

**Max to Process Per Subdomain:**
Maximum number of pages to process per subdomain. (Default: 100)

#### Custom Headers

**User-Agent:**
Custom User-Agent string to use when crawling.

**Referer:**
Custom Referer header to use when crawling.

**Cookie:**
Custom Cookie header to use when crawling.

**Accept-Language:**
Custom Accept-Language header to use when crawling.

#### Knowledge Settings

**Source Tags:**
Source tags can be used to filter the search scope from the Flow. Press ENTER to add a Source Tag. (Default: ["Web Page"])

---

## Knowledge Connector: Diffbot Webpage
Diffbot Webpage connector automatically creates knowledge sources by procesing the given web page(s) content through Diffbot's extraction service.

### Fields

**Connection:**
Connection field as defined in [Connection](#diffbot-connection)

**Web page URL:**
URLs of the Web pages to import content from

**Web page Type**
Type of Extract API to call i.e. Product, List etc. If type is not known then choose 'Analyze', however the quality of the result may degrade if 'Analyze' type is chosen. Available options:

**Source Tag:**
Sets the tags that you want to associate with each Knowledge Source

---

# Diffbot Connection

This module needs a CognigySecret to be defined and passed to the Knowledge Connector. A CognigySecret can be added to any Cognigy Project and allows for the encryption of sensitive data. The secret must have the following keys:
- **accessToken:** Access token to access the diffbot api


---

**Note:** The connector uses the following MIT-licensed libraries: [`json-to-plain-text`](https://www.npmjs.com/package/turndown), [`langchain`](https://www.npmjs.com/package/langchain), [`flattie`](https://www.npmjs.com/package/flattie), [`fetch-retry`](https://www.npmjs.com/package/fetch-retry)


