# Service Now Custom Module

Integrates the Service Now Software with Cognigy.AI.

Table Node Source: https://developer.servicenow.com/app.do#!/rest_api_doc?v=madrid&id=c_TableAPI

**Secrets**
You have to define three secrets to use this Custom Module: 

- username
- password
- instance (e.g. https://dev12345.service-now.com)

## Node: GETFromTable

Returns the data from a requested [Table](https://docs.servicenow.com/bundle/jakarta-servicenow-platform/page/administer/reference-pages/reference/r_TablesAndClasses.html?title=Tables_and_Classes) and stores it into the Cognigy Context. You have to specify the columns (Fields) you want to show in the results.



## Node: PostToTable

This Node will post the given **data** to the chosen **table**. The data could look like this: 

```json
{
  "short_description": "I lost my keys"
}
```

The result will be a json object including the new table entry:

```json
"posted": {
    "first_reported_by_task": "",
    "parent": "",
    "made_sla": "true",
    "watch_list": "",
    "fix_communicated_by": "",
    "upon_reject": "cancel",
    "sys_updated_on": "2019-04-12 12:54:09",
    "cause_notes": "",
    "approval_history": "",
    "number": "PRB0040026",
    "resolved_by": "",
    "sys_updated_by": "blub",
    "opened_by": {
      "link": "https://23456789.service-now.com/api/now/table/sys_user/123456789098765432",
      "value": "123456789098765432"
    },
```



## Node: DeleteFromTable

This Node deletes the entry with the given **sysId** and returns a success message if nothing gone wrong: 

```json
{
  "deleted": "succefully deleted entry with id da4fe285dbbc330045da2bfa4b9619d6"
}
```



## Node: PatchRecordInTable

This node updates an entry in your chosen Service Now table. You have to define the **sysId** and the **data** to update. If you don't know the sysId of your entry, just execute the **GetFromTable** Node of this Custom Module and take a look into the **CognigyContext**. 

To define the data to update, you have to use a JSON format such as: 

```json
{
  "short_description": "I updated the short description of this entry"
}
```

As response you will get a JSON object, which looks like: 

```json
"patched": {
    "first_reported_by_task": "",
    "parent": "",
    "made_sla": "true",
    "watch_list": "",
    "fix_communicated_by": "",
    "upon_reject": "cancel",
    "sys_updated_on": "2019-04-13 08:16:38",
    "cause_notes": "",
    "approval_history": "",
    "number": "PRB0040027",
    "resolved_by": "",
    "sys_updated_by": "blub",
    "opened_by": {
      "link": "https://123456.service-now.com/api/now/table/sys_user/6816f79cc0a8016401c5a33be04be441",
      "value": "6816f79cc0a8016401c5a33be04be441"
    },
```

If you now open your updated table in your **Service Now Instance** you will see the difference. 



## Node: GETAttachments

With this node you can reach your Service Now Attachments and store them to your CognigyContext. For this, there are two parameters you can use: 

- limit
  - How many results you want to store, e.g. 1
- query
  - A query to filter your attachments, e.g. file_name=document.doc
  - [Read more here](<https://developer.servicenow.com/app.do#!/rest_api_doc?v=madrid&id=r_AttachmentAPI-GET>)

The result will look like the following: 

```json
"attachments": [
    {
      "size_bytes": "3549",
      "file_name": "image",
      "sys_mod_count": "0",
      "average_image_color": "",
      "image_width": "",
      "sys_updated_on": "2092-01-24 02:00:31",
      "sys_tags": "",
      "table_name": "ZZ_YYdb_image",
      "sys_id": "0987654321234567890o987654323456789",
      "image_height": "",
      "sys_updated_by": "mark.odonnell",
      "download_link": "https://12345678.service-now.com/api/now/attachment/0987654321234567890o987654323456789/file",
      "content_type": "image/png",
      "sys_created_on": "2019-01-24 02:00:31",
      "size_compressed": "3215",
      "compressed": "true",
      "state": "",
      "table_sys_id": "0987654321234567890o987654323456789",
      "chunk_size_bytes": "",
      "sys_created_by": "max.mustermann"
    }
  ]
```



## Node: GETAttachmentById

If you don't want to get all attachments, you can reach one by it's specifiy **sysId** by using this node here. You can get the sysId by executing the **GETAttachments** node. The result will look like the above one.



## Node: DeleteAttachment

With this node you can easily delete an attachment. You have to type in the attachment's **sysId** to get the success message: 

```json
{
  "deleted": "succefully deleted attachment with id 1894eef4ef331000914304167b2256c2",
}
```

## Node: PostAttachment

Post an attachment to a specific table entry, such as entry X in table `problem`, where you need the following: 

- table entry `sys_id`
- location of the attacchment, e.g. AWS S3 url 
- the file name

If you now open your Service Now instance, you will see the attachment in the history of your entry.

The response will look like the following:

The `table_sys_id` is the entrie's id and the `sys_id` is the id of the new attachment.

```json
{
  "posted": {
    "size_bytes": "21",
    "file_name": "lol.py",
    "sys_mod_count": "0",
    "average_image_color": "",
    "image_width": "",
    "sys_updated_on": "2019-04-25 08:49:32",
    "sys_tags": "",
    "table_name": "problem",
    "sys_id": "71f37451db01330045da2bfa4b961968",
    "image_height": "",
    "sys_updated_by": "admin",
    "download_link": "https://123456.service-now.com/api/now/attachment/71f37451db01330045da2bfa4b961968/file",
    "content_type": "multipart/form-data",
    "sys_created_on": "2019-04-25 08:49:32",
    "size_compressed": "41",
    "compressed": "true",
    "state": "",
    "table_sys_id": "3fd37451db01330045da2bfa4b96198e",
    "chunk_size_bytes": "734003",
    "sys_created_by": "admin"
  }
}
```

