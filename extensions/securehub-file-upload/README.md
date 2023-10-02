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

In the conection we will need your username and password.