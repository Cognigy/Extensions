import { createExtension } from "@cognigy/extension-tools";

import { stripeConnection } from "./connections/stripeConnection";
import { createCardTokenNode, onSuccesCreateCardToken, onErrorCreateCardToken } from "./nodes/createCardToken";
import { createOrderNode, onErrorCreateOrder, onSuccesCreateOrder } from "./nodes/createOrder";
import { createSKUNode, onSuccesCreateSKU, onErrorCreateSKU } from "./nodes/createSKU";
import { onErrorPayOrder, onSuccessPayOrder, payOrderNode } from "./nodes/payOrder";


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
		onErrorPayOrder
	],

	connections: [
		stripeConnection
	]
});