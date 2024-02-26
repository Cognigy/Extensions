## Upload To SecureHub

This Custom Module will allow us to upload files to a third party storage account triggering the ``securehub-file-upload`` Webchat [plugin](https://github.com/Cognigy/WebchatPlugins/tree/master/plugins/file-upload).

**IMPORTANT (CORS):**

One could get an error message while executing these Custom Nodes where it says that the *origin https://webchat-demo.cognigy.ai has been blocked by CORS policy*. In order to fix this, the **CORS Configuration** needs to be adjusted -- you need to allow the webchat to store files in the correct location.

## Upload To Securehub Storage

In order to use the custom module correctly, some items are needed.

* Folder Name

This is the name given to the folder where the files will be uploaded. 

* Base URL

The base URL for the SecureHub environment. Usually *securehub.yourcompanyname.com* or a similar pattern. "https://" etc. are not required.

* Connection

In the connection we will need your username and password.

## Additional Options

* Reject Unauthorized Certificates

Automatically set to false. Leave as false if you receive certificate errors from SecureHub.

* Define Link Expiration

Should the standard link expiration be used or would you like to use a custom date. 

* Link Expiration (in Days)

In how many days from the current day should the link expire? 