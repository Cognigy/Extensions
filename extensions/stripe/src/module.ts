import { createExtension } from "@cognigy/extension-tools";

import { stripeConnection } from "./connections/stripeConnection";
import { createCardTokenNode, onSuccesCreateCardToken, onErrorCreateCardToken } from "./nodes/createCardToken";
import { createOrderNode, onErrorCreateOrder, onSuccesCreateOrder } from "./nodes/createOrder";
import { createSKUNode, onSuccesCreateSKU, onErrorCreateSKU } from "./nodes/createSKU";
import { createCustomerNode } from "./nodes/customers/createCustomer";
import { getCustomerNode, onFoundCustomer, onNotFoundCustomer } from "./nodes/customers/getCustomer";
import { getCustomerPaymentMethodsNode, onFoundCustomerPaymentMethods, onNotFoundCustomerPaymentMethods } from "./nodes/customers/getCustomerPaymentMethods";
import { getCustomerInvoicesNode, onFoundInvoices, OnNotFoundInvoices } from "./nodes/invoices/getInvoices";
import { onErrorPayInvoice, onSuccessPayInvoice, payInvoiceNode } from "./nodes/invoices/payInvoice";
import { onErrorPayOrder, onSuccessPayOrder, payOrderNode } from "./nodes/payOrder";
import { getProductsNode } from "./nodes/products/getProducts";


export default createExtension({
	nodes: [
		createCardTokenNode,
		onSuccesCreateCardToken,
		onErrorCreateCardToken,

		createSKUNode,
		onSuccesCreateSKU,
		onErrorCreateSKU,

		createOrderNode,
		onSuccesCreateOrder,
		onErrorCreateOrder,

		payOrderNode,
		onSuccessPayOrder,
		onErrorPayOrder,

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
		onErrorPayInvoice
	],

	connections: [
		stripeConnection
	]
});