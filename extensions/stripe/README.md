# Stripe

With this Extension, one can work with the [Stripe](https://stripe.com) payment service and, e.g. create and pay an order.

## Connection

Inside of Stripe, one can navigate to the *Developer* section and copy the **Secure API Key** which is required for the payment executions.

- secureKey

## Flow Nodes

All exposed Flow Nodes of this Extension follow the [Stripe API](https://stripe.com/docs/api?lang=node) whereby the respective result returns `response.data` if there is a list of results -- e.g. invoices, charges, products, and more.

### Exposed Nodes

- *Customer*
  - [Get Customer](https://stripe.com/docs/api/customers/list?lang=node)
    - Tokens (Context):
      - Stripe Customer ID
      - Stripe Customer Name
  - [Create Customer](https://stripe.com/docs/api/customers/create?lang=node)
    - Tokens (Context):
      - Stripe Customer ID
  - [Get Payment Methods](https://stripe.com/docs/api/cards/list?lang=node)
- *Invoices*
  - [Get Invoices](https://stripe.com/docs/api/invoices/list?lang=node)
  - [Pay Invoice](https://stripe.com/docs/api/invoices/pay)
- *Orders*
  - [Create Order](https://stripe.com/docs/api/orders/create)
  - [Create Card Token](https://stripe.com/docs/api/tokens/create_card)
  - [Create SKU](https://stripe.com/docs/api/skus/create)
  - [Pay Order](https://stripe.com/docs/api/orders/pay?lang=node)

- *Products*
  - [Get Products](https://stripe.com/docs/api/products/list)
- *Refunds*
  - [Get Charges](https://stripe.com/docs/api/charges/list)
  - [Create Refund](https://stripe.com/docs/api/refunds/create)
- *Promotion*
  - [Create Promotion Code](https://stripe.com/docs/api/promotion_codes/create)
    - **The promotion code will be added to an existing Stripe Coupon. Therefore, the `coupon` parameter needs to be the ID, e.g. TEST_COUPON, of the coupon which can be found in the Stripe Dashboard.**
    - Tokens (Input):
      - Stripe Promotion Code

Almost all of above mentioned Nodes contain so-called Child-Nodes in order to continue with the Flow in the case of a **successful** or **unsuccessful/empty** result. With this, the virtual agent can switch the conversation if, for example, open invoices were found or not.