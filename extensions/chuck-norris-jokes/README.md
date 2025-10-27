
# Chuck Norris Jokes

This extension provides a Knowledge Connector to integrate external data sources into Cognigy.AI by using publicly available APIs, e.g., the Chuck Norris Jokes API.

### Chuck Norris Jokes Knowledge Connectors

The Chuck Norris Jokes Knowledge Connector fetches random Chuck Norris Jokes using a web API and creates a Knowledge Source with Knowledge Chunks containing the fetched jokes.

The following table shows the fields to configure when using this Knowledge Connector.

| Field                      | Description                                                                                                                                                                                                                                                |
|----------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Source name prefix         | Sets a prefix to be appended to Knowledge Source's name. For example, if you enter `Chuck Norris Jokes`, the Knowledge Source created is named `Chuck Norris Jokes - <category>`.                                                                          |
| Categories to fetch        | Sets the categories of jokes to fetch. You can find the available categories at [chucknorris.io](https://api.chucknorris.io/), in the **Usage** section, or at [https://api.chucknorris.io/jokes/categories](https://api.chucknorris.io/jokes/categories). |
| Number of jokes per source | Sets a number of jokes per category.                                                                                                                                                                                                                       |
| Source Tags                | Sets the Source Tags that you want to add to Knowledge Source. Source Tags can be used to filter the search scope when using a Search Extract Output Node.                                                                                                 |