import { IConnectionSchema } from "@cognigy/extension-tools";

export const raffleConnection: IConnectionSchema = {
	type: "raffle",
	label: "Raffle Authentication",
	fields: [
		{ fieldName: "apikey" },
	]
};