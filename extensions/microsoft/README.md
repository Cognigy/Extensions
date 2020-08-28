# Microsoft

This Extension provides login to a Microsoft account and use the **Graph API** to perform various Microsoft functions -- such as scheduling a meeting or get personal user information.

## Table of Contents

1. Login to Microsoft
2. Use the Graph API

### Login to Microsoft

- Please follow the steps of [this tutorial](./login/login.md)

**Connection:**

- clientId
    - key: clientId
    - value: The Azure App Regestrations client ID

Login to portal.azure.com and create a new **App regestration**. After this, you will see your client ID.

- clientSecret
    - key: clientSecret
    - value: The Client Secret of your App regestration

You need to click on **Certificates & Secrets** in the left side menu and create a new Client secret.

## Node: Start Authentication

This node starts the Webchat plugin `microsoft_auth` to open the **Login with Microsoft** button in the webchat. 

## Node: Get Authentication Token

This node returns the final `access_token`: 
```json
{
    "key": "value",
    "storeThis": {
        "token_type": "Bearer",
        "scope": "User.Read profile openid email",
        "expires_in": 3600,
        "ext_expires_in": 3600,
        "access_token": "eyJ0eXA...-2dg"
    }
}
```

### Use the Graph API

After storing the **access_token** into the Cognigy Context, the AI is ready to call Graph API functions by adding the specific nodes to a Flow.

**Nodes:**

- Get User Details
- Schedule Meeting
- Get Events from Calendar