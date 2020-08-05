# Elastic Search Extension

With this Extension you can query for Elastic Search instance to use these information within the conversation.

**Connection (Elastic Search Instance):**

- Key: host
- Value: Your Elastic Search instance, e.g. `elastic-instance:9200`

## Node: searchSimple

Provides a simple term search and returns all found `hits`. For example, you can search for the term `pants`, where you'll get the following response: 

```json
"response": {
    "took": 0,
    "timed_out": false,
    "_shards": {
      "total": 0,
      "successful": 0,
      "skipped": 0,
      "failed": 0
    },
    "hits": {
      "total": {
        "value": 0,
        "relation": "eq"
      },
      "max_score": 0,
      "hits": [
          "THE FOUND HITS FOR 'pants'"
      ]
    }
  }
```

## Node: Search With DSL

For a more complex search you can use Elastic's [DSL Querying structure](http://okfnlabs.org/blog/2013/07/01/elasticsearch-query-tutorial.html#query-dsl-overview). Therefore you have to insert a query `body` in this node, which could look like: 

```json
{
  "query": {
    "match": {
      "body": "elasticsearch"
    }
  }
}
```

The other two argruments, you have to define, are the elastic search `index` and the `type`. So the index could be `twitter` were all tweets are stored; therefore the type would be `tweets`.

The respponse will look similar to the **searchSimple** node.

