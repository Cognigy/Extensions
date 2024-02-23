import { createExtension } from "@cognigy/extension-tools";

import { stripeConnection } from "./connections/stripeConnection";
import { createCustomerNode } from "./nodes/customers/createCustomer";
import { getCustomerNode, onFoundCustomer, onNotFoundCustomer } from "./nodes/customers/getCustomer";
import { getCustomerPaymentMethodsNode, onFoundCustomerPaymentMethods, onNotFoundCustomerPaymentMethods } from "./nodes/customers/getCustomerPaymentMethods";
import { getCustomerInvoicesNode, onFoundInvoices, OnNotFoundInvoices } from "./nodes/invoices/getInvoices";
import { onErrorPayInvoice, onSuccessPayInvoice, payInvoiceNode } from "./nodes/invoices/payInvoice";
// import { onErrorPayOrder, onSuccessPayOrder, payOrderNode } from "./nodes/orders/payOrder";
import { getProductsNode } from "./nodes/products/getProducts";
import { getChargesNode, onChargesFound, OnNoChargesFound } from "./nodes/refunds/getCharges";
import { createRefundNode, onErrorRefund, onSuccessRefund } from "./nodes/refunds/createRefund";
import { createPromotionCodeNode } from "./nodes/promotion/createPromotionCode";
import { createPaymentIntentNode } from "./nodes/paymentIntents/createPaymentIntent";


export default createExtension({
	nodes: [
		getProductsNode,

		getCustomerNode,
		onFoundCustomer,
		onNotFoundCustomer,

		createCustomerNode,

		getCustomerPaymentMethodsNode,
		onFoundCustomerPaymentMethods,
		onNotFoundCustomerPaymentMethods,

		getCustomerInvoicesNode,
		onFoundInvoices,
		OnNotFoundInvoices,

		payInvoiceNode,
		onSuccessPayInvoice,
		onErrorPayInvoice,

		getChargesNode,
		onChargesFound,
		OnNoChargesFound,

		createRefundNode,
		onSuccessRefund,
		onErrorRefund,

		createPromotionCodeNode,

		createPaymentIntentNode
	],

	connections: [
		stripeConnection
	],

	options: {
		label: "Stripe"
	}
});