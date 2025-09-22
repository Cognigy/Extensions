
# Diffbot

This Extension provides two basic Diffbot Knowledge Connectors allow integration between Cognigy.AI and Diffbot:

- One that crawls through web pages and creates Knowledge Sources with Knowledge Chunks.
- Another that accepts web page URL and generates Knowledge Sources directly.

## Table of Contents
- [Diffbot Extension](#diffbot-extension)
- [Diffbot Crawler](#diffbot-crawler)
- [Diffbot Webpage Connector](#diffbot-webpage-connector)
- [Diffbot Connection](#diffbot-connection)

---

# Diffbot Extension

The Diffbot Extension lets you extract structured data from web pages in JSON format with the following Knowledge Extensions:

- [Diffbot Crawler](#diffbot-crawler)
- [Diffbot Webpage Connector](#diffbot-webpage-connector)

## Diffbot Crawler

The Diffbot Crawler automatically creates Knowledge Sources by crawling web pages from the root page and process their content using Diffbot services. For more information, see the [Diffbot Crawl API](https://docs.diffbot.com/reference/crawl-introduction) documentation. You can also see the running crawler on the [Diffbot dashboard](https://app.diffbot.com/crawls/)

### Chunking

The JSON content returned by Diffbot is flattened and processed using recursive character splitting to create text chunks that are presented in Cognigy.AI as Knowledge Chunks. Each Knowledge Chunk is prefixed with the page title, content type, and URL for web page.

### Fields

#### Basic Settings

| Basic Settings   | Description                                                                                                                                                                                                                                                                 |
|------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Connection       | The Connection module as defined in [Connection](#diffbot-connection).                                                                                                                                                                                                      |
| Seed URLs        | URLs from which Diffbot starts crawling. Enter one URL per line or entry, for example, `https://www.cognigy.com/careers`.                                                                                                                                                   |
| Extract API Type | Type of Extract API endpoint to call. If the type isn't known, choose **Analyze**. However, selecting **Analyze** may reduce the quality of the content extraction. Available options: Analyze, Product, Article, Event, List, Video, Image, Discussion, FAQ, Organization. |
| Query String     | Query parameters to be passed to the Extract API request, for example, `fields=title,text`                                                                                                                                                                                  |
| Source Tags      | You can use Source tags to filter the search scope when using a Search Extract Output Node. Press ENTER to add a Source tag. The default value is `["Web Page"]`.                                                                                                           |
| Retain Crawler   | Selects whether to retain the crawler after the crawling operation, the undeleted crawlers can be seen on the Diffbot dashboard. The default value is `true`.                                                                                                               |

#### Crawling Limits

| Crawling Limit             | Description                                                                                                               |
|----------------------------|---------------------------------------------------------------------------------------------------------------------------|
| Crawling Patterns          | Limits the URLs to crawl to the value in this field.                                                                      |
| URL Crawling Regex         | Sets regex to filter matching URL patterns to crawl.                                                                      |
| Max to Crawl               | Sets the maximum number of pages to crawl. The default value is `100000`.                                                 |
| Max to Crawl Per Subdomain | Sets the maximum number of pages to crawl per subdomain. The default limit is `-1`, which corresponds to unlimited pages. |
| Max Hops                   | Sets the maximum number of hops away from the seed URL. The default value is `-1`, which corresponds to unlimited hops.   |
| Crawl Delay                | Sets the time in seconds to wait between requests to the same server. The default valie is `0.25`.                        |
| Obey Robots                | Selects whether to obey `robots.txt` rules of the website. The default value is `true`.                                   |
| Restrict Domain            | Limits crawling to seed domains, for example, `https://www.cognigy.com`. The default value is `true`.                     |
| Restrict Subdomain         | Limits crawling to seed subdomains. The default value is `false`.                                                         |
| Use Proxies                | Selects whether to use Diffbot's proxy servers for crawling. The default value is `false`.                                |
| Canonical Deduplication    | Selects whether to skip pages with a differing canonical URL. The default value is `true`.                                |

#### Processing Limits

| Processing Limits            | Description                                                                            |
|------------------------------|----------------------------------------------------------------------------------------|
| Processing Patterns          | Limits the URLs to process to the value in this field.                                 |
| URL Processing Regex         | Sets regex to filter matching URL patterns to process.                                 |
| HTML Processing Patterns     | Limits the pages to process to the value in this field.                                |
| Max to Process               | Sets the maximum number of pages to process. The default value is `100`.               |
| Max to Process Per Subdomain | Sets the maximum number of pages to process per subdomain. The default limit is `100`. |

#### Custom Headers

| Header          | Description                                         |
|-----------------|-----------------------------------------------------|
| User-Agent      | Custom User-Agent string to use when crawling.      |
| Referer         | Custom Referer header to use when crawling.         |
| Cookie          | Custom Cookie header to use when crawling.          |
| Accept-Language | Custom Accept-Language header to use when crawling. |

## Diffbot Webpage Connector

The Diffbot Webpage Connector automatically creates Knowledge Sources by processing web page content through Diffbot's extraction service.

### Fields

| Field              | Description                                                                                                                                                                                                                                                                 |
|--------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Connection         | The Connection module as defined in [Connection](#diffbot-connection).                                                                                                                                                                                                      |
| Web page URL       | Sets the URLs of the web pages to import content from.                                                                                                                                                                                                                      |
| Extract API Type | Type of Extract API endpoint to call. If the type isn't known, choose **Analyze**. However, selecting **Analyze** may reduce the quality of the content extraction. Available options: Analyze, Product, Article, Event, List, Video, Image, Discussion, FAQ, Organization. |
| Source Tag         | Sets the Source tags you want to add to the Knowledge Sources.                                                                                                                                                                                                              |

# Diffbot Connection

This module requires a CognigySecret to be defined and passed to the Knowledge Connector. You can add a CognigySecret to any Cognigy Project to allow for the encryption of sensitive data. The secret must have the following keys:

- **accessToken:** Access token to access the Diffbot API

---

**Note:** This Knowledge Connector uses the following MIT-licensed libraries: [`json-to-plain-text`](https://www.npmjs.com/package/turndown), [`langchain`](https://www.npmjs.com/package/langchain), [`flattie`](https://www.npmjs.com/package/flattie), [`fetch-retry`](https://www.npmjs.com/package/fetch-retry)
