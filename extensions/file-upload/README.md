## File Upload

This Custom Module will allow us to upload files to a third party storage account triggering the ``file-upload`` Webchat [plugin](https://github.com/Cognigy/WebchatPlugins/tree/master/plugins/file-upload), depending on the third party storage used, we will have to set them up accordingly.

**IMPORTANT (CORS):**

One could get an error message while executing these Custom Nodes where it says that the *origin https://webchat-demo.cognigy.ai has been blocked by CORS policy*. In order to fix this, the **CORS Configuration** in AWS or Azure needs to be adjusted -- you need to allow the webchat to store files in the correct location.

## Upload To Microsoft Azure Storage

In order to use the custom module correctly, some items are needed from your Azure Storage account.

* [``Storage Account Name``](https://docs.microsoft.com/en-us/azure/storage/common/storage-account-overview)

This is the name of the account, the URL that this Custom Module uses to give a temporary access to upload data to the storage requires the name of the account, so it is very important to write it correctly.  

* [``Access Key``](https://docs.microsoft.com/en-us/azure/storage/common/storage-account-manage)

This is the value that we will use as a [secret](https://docs.cognigy.com/docs/secrets) in Cognigy, with this you can authorize operations regarding your Azure  Storage account. You can get it in your Azure Storage Account settings under "Access Keys".  
Note that if you use this key in your project and then you generate a new one in your Azure Storage Account, the old key will no longer be valid, so you will have to put your new key again in your project.

After gathering this data and upload the Custom Module to Cognigy, you will have to create a secret, the key of the secret has to be: 

``key = secret_access_key``  ( literally "secret_access_key" )
 
 and the value  
 
 ``value = <Your account storage "Access Key">``
 
*It is very imprtant to use* **secret_access_key** *as the value of "key", so Cognigy will recognize what you mean by that.*

Now we just need to adjust our node, use the **Upload To Azure Container** node in a flow 

### Upload To Azure Container Node

In this Node some values are required and other optionals. First, we have ``AccountStorageName``, this is the name of your Azure Storage Account and it's required.

Then we have ``ContainerName`` This value is optional, you can leave it blank and it will generate a random id as a name for the container or you can put a name but, you have to be careful how you name it. There are some [rules](https://docs.microsoft.com/en-us/rest/api/storageservices/naming-and-referencing-containers--blobs--and-metadata) to follow. Be also aware that if a application request to create a container and a container is already created with that name it will ignore it and use the already created container. Please read the documentation from Azure Storage regarding Container and Blobs.

Now we have the ``Secret`` field, you have to select the secret that you created in Cognigy with your Azure Store Account "Access key"

There is also a ``Timeout`` field, it's also optional. Here you can put a number between 1 and 60, this is the time in minutes setting how long will the container upload access token be valid ( the time window in where uploading a file is possible), after this time runs out, it would not be possible to use the token anymore. Another toke has to be created ( the flow must call the node again )

And that is all you need!
