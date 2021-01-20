# Google Firebase

Store any kind of data in a [**Google Firebase Realtime Database**](https://firebase.google.com).

**Connection**

In order to use this Extension, one needs to add a *Web App* in Firebase and provide the following credentials:

- apiKey
- projectId
- databaseName
- bucket

## Node: Set

This nodes posts / creates a new database entry while it will return "success" when the execution was successful.

## Node: Get

This node retrieves the information of a specific entry in the database while it will return the entire child data object of the entry:

```json
{
    "key1": "data",
    "key2": {
        "key": "value"
    }
}
```

## Node: Update

This node updates or deletes an entry in the database

### Update Entry

One can update an entry by providing the same data object such as in the **Set** node.

### Delete Entry / Value

If one wants to delete a value or an entry, the *value* can be set to `null`:

```json
{
    "name": null
}
```
