import { IConnectionSchema } from "@cognigy/extension-tools";

export const amadeusOAuth2Connection: IConnectionSchema = {
	type: "amadeus-oauth2",
	label: "Amadeus OAuth2",
	fields: [
		{ fieldName: "apiUrl" },
		{ fieldName: "clientId" },
        { fieldName: "clientSecret" }
	]
};