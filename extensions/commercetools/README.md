# commercetools

With this Extension, the Cognigy.AI Virtual Agent is able to manage customer orders or suggest products based on the users' ideas. Therefore, it could be used in e-commerce use-cases on a website/app or within a physical store in order to assist the store manager with stock information.

## Connection

Inside of commercetools, an **API Client** must be given. This can be configured based on this documentation: https://docs.commercetools.com/api/authorization#creating-an-api-client. As soon as the client is created, the required information will be displayed to the user inside of commercetools:

- projectKey
- clientId
- secret
- scope
- apiUrl
- authUrl

## Nodes: Get Customer

Based on the `full name` or `email address`, an existing customer can be retrieved from the commercetools system. The user details will be displayed as a JSON object in the following format: https://docs.commercetools.com/api/projects/customers

## Nodes: Get Orders

Based on the `order number` or `customer email address` an existing order can be retreived from the commercetools system in order to manage it within the conversation. These details will be displayed in the following JSON format: https://docs.commercetools.com/api/projects/orders#order

## Nodes: Search Products

Based a `search text`, the Virtual Agent can search for a product inside of commercetools. The found products will be stored as list in the following format: https://docs.commercetools.com/api/projects/products#product

## Nodes: Suggest Products

If the user doesn't know exactly what they would like to do, the Virtual Agent can suggest a product. In this case, the suggested products will be stored in the following format: https://docs.commercetools.com/api/projects/products#product