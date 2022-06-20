# BigCommerce

With this Extension in place, the virtual agent can access the **Store** in order to validate the customer, check their orders or retrieve products, brands, and categories.

## Connection

Since the Extension has to access various store resources, a Connection is required for authenticating the Cognigy.AI virtual agent. Therefore, please follow this documentation and create a *Store API Account*: https://developer.bigcommerce.com/docs/ZG9jOjIyMDYxMw-authenticating-big-commerce-s-rest-ap-is#store-api-credentials. Afterward, the

1. **Access Token** and
2. **Store Hash**
   1. Can be found in the URL, e.g. https://api.bigcommerce.com/stores/  **store hash**  /v3/

must be provided within the Connetion. 

## Flow Nodes

- [Get Customer Info](https://developer.bigcommerce.com/api-reference/761ec193054b6-get-all-customers)
- [Get Customer Orders](https://developer.bigcommerce.com/api-reference/82f91b58d0c98-get-all-orders)
- [Validate Customer](https://developer.bigcommerce.com/api-reference/3d731215a3dcb-validate-a-customer-credentials)
- [Get All Brands](https://developer.bigcommerce.com/api-reference/c2610608c20c8-get-all-brands)
- [Get All Categories](https://developer.bigcommerce.com/api-reference/9cc3a53863922-get-all-categories)
- [Get All Products](https://developer.bigcommerce.com/api-reference/4101d472a814d-get-all-products)