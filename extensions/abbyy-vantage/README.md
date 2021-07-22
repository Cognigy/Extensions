# Abbyy Vantage

This Extension provides various **Abbyy Vantage** functions in order to get skills and run defined transactions.

- [API Documentation](https://vantage-preview.abbyy.com/api/index.html?urls.primaryName=publicapi%2Fv1)


## Connections

In order to use the whole Extension, two different Connections need to be defined.

**OAuth:**

Takes the OAuth information and is required for executing the **Authenticate** Flow Node.

- clientId
  - The Abbyy instance client ID
- clientSecret
  - The Abbyy instance client Secret
- username
- password
- url
  - The Abby authentication url
  - e.g. https://vantage-preview.abbyy.com/auth/connect/token

**Instance:**

After successfully authenticating the system user, the actual **Abbyy Vantage** instance needs to be defined as it will be used by all other Flow Nodes in this Extension.

- instanceUri
  - e.g. vantage-preview.abbyy.com
  - *Please make sure to remove the last "/" from the url*

### Node: Authenticate

Uses the OAuth Connection and creates the required Access Token that is stored in Cognigy:

```json
{
    "abbyy": {
        "auth": {
        "access_token": "eyJh...",
        "expires_in": 2592000,
        "token_type": "Bearer",
        "scope": "openid permissions"
        }
    }
}
```

**Please store the result into the [Cognigy Context](https://docs.cognigy.com/docs/context) in order to make it accessible during the whole conversation.**

### Node: Get Skills

Retrieves all skills for the currently logged in Abbyy Vantage user -- based on the provided access token.

```json
{
    "abbyy": {
        "skills": [
            {
                "id": "3456tdfh-23453-345-bee5-3563grfedge",
                "name": "MySkillOne",
                "type": "Document"
            }
        ]
    }
}
```

### Node: Run Transaction

Runs an Abbyy Skill and creates a new transaction based on a `skill ID` and `file content`. Finally, it returns the new `transaction ID`:

```json
{
    "abbyy": {
      "run": {
        "transactionId": "c369fb23-9844-4e8f-9ba7-23453334"
      }
  }
}
```

### Node: Get Transaction

After running a skill and creating a new transaction with the previous Flow Nodes, the conversation can check if the results are already available and continue based on this information.

```json
{
  "transaction": {
    "Transaction": {
      "Id": "...",
      "SkillId": "...",
      "SkillName": "MySkillOne",
      "Documents": [
        {
          "Id": "...",
          "ExtractedData": {
            "DocumentDefinition": {
              "RootConcept": {
                "Id": "root",
                "Name": "Empty",
                "Fields": [
                  {
                    "Id": "...",
                    "Name": "Address",
                    "Type": "String",
                    "Cardinality": {
                      "Min": 0,
                      "Max": 1
                    }
                  },
                  "...": "..."
                ],
              }
            }
          }
        }
      ]
    }
  }
}
```
