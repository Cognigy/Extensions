# Login to Microsoft

- Please follow the steps of [this tutorial](../login/login.md)

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

This node starts the Webchat plugin in order to open the **Sign in with Microsoft** button in the webchat.

- [Microsoft Auth Webchat Plugin](../login/webchat-plugin/README.md)

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

# Next Steps

- [Use the Graph API](./graph-api.md)