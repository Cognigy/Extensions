# Microsoft Login Redirect URI / Auth Callback (Webserver)

In order to login to a Microsoft account, a webserver is required that forwards the authentication from `login.microsoft.com` / `login.microsoftonline.com` to the Webchat and thus to Cognigy.AI.

## Configure the Server

1. Open `./webserver/static/index.html`.
   1. In the `initWebchat()` method, change the config url with the one from your Cognigy.AI webchat endpoint.
2. Run `npm i` in `./webserver/` to install all necessary NPM packages.

## Start & Use the Server

1. Run `http-server static/` in the `./webserver/` folder.
2. Open a browser and visit `http://localhost:8080`.

Now you can talk to your Cognigy.AI virtual agent.

## Register an Azure Application

1. We need to create a new **Application** in our Azure Portal. Login to [https://portal.azure.com/](https://portal.azure.com/#home) and search for *App registrations*.
2. Click on **New registration** in the top left corner.
3. Name your Application *Graph* or something similar
4. Fill the **Redirect URI** with the following url: 
	5. http://localhost:8080/auth-callback
	6. This url will be called by Microsoft after the user logged in successfully. For Cognigy use, this url could send a message to the bot backend to trigger a new intent.
5. Click on **Register** and create the new application.
6. Now you should see an overview page which includes several IDs, such as:
	7. Application (client) ID
		8. **We need this**
	8. Directory (tenant) ID
	9. Object ID
7. Next to the `clientId`, we need to define a `clientSecret` for our application.
8. Therefore, click on the **Certificates & secrets** button in the left side menu.
	9. Now click on **new client secret**, give it a informative description and set the expiration time to 1 year.
	10. Click on **Add**
	11. It's very important, that you store the `clientSecret` in a password orchestrator on your computer!
