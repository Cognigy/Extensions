# Elastic Search

With this Extension one can query Elastic Search to use these information within the conversation.

**Connection (No Auth):**

Since an organization could use different authentication methods, this Extension implemented `cloud`, `basic` and `apiKey` authentication.

- [Please read this documentation for more information](https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/auth-reference.html#auth-reference)


## Node: Search

For searching one can use Elastic's [DSL Querying structure](http://okfnlabs.org/blog/2013/07/01/elasticsearch-query-tutorial.html#query-dsl-overview). Therefore one has to insert a query `body` in this node, which could look like: 

```json
{
  "query": {
    "match": {
      "quote": "elasticsearch"
    }
  }
}
```

The other argrument is the elastic search `index`. So the index could be `twitter` were all tweets are stored; therefore the type would be `tweets`.

