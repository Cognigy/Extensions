# Stripe

With this Extension, one can work with the [Stripe](https://stripe.com) payment service and, e.g. create and pay an order.

## Connection

Inside of Stripe, one can navigate to the *Developer* section and copy the **Secure API Key** which is required for the payment executions.

- secureKey

### Node: Create Card Token

Create a new credit card for a payment and returns the token as ID.

### Node: Create SKU

Creates a new Stock Keeping Unit for a product that could be used for a payment of an order.

### Node: Create Order

Creates a new order with a list of items and shipping address.

### Node: Pay Order

Finally, the created order can be paid using the recently created **card token**, and **SKU**.