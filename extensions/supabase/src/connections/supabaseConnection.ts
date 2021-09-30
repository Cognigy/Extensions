import { IConnectionSchema } from "@cognigy/extension-tools";

export const supabaseConnection: IConnectionSchema = {
	type: "supabase",
	label: "Supabase Credentials",
	fields: [
		{ fieldName: "supabaseUrl" },
        { fieldName: "supabaseKey" }
	]
};