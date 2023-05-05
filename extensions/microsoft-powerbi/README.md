# Microsoft PowerBI

This Extension allows you to connect to Microsoft PowerBI directly.

## Connection

The Extension requires a [PowerBI Azure App Registration](https://learn.microsoft.com/en-us/power-bi/developer/embedded/register-app?tabs=customers), while the connection takes the `username` and `password` of an Azure Active Directory person that is assigned to this application in order to authenticate. In total, the following values must be provided:

- Client ID (Application ID)
- Tenant ID
- Username
- Password

Moreover, the Azure Application must include the PowerBI API Permissions to work with Datasets.

## Node: Executre Queries

Please read the [API Documentation](https://learn.microsoft.com/en-us/rest/api/power-bi/datasets/execute-queries).