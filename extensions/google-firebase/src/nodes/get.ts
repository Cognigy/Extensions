import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

// Firebase App (the core Firebase SDK) is always required
import firebase from "firebase/app";

// Add the Firebase services that you want to use
import "firebase/auth";
import "firebase/database";

export interface IGetParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			apiKey: string;
			projectId: string;
			databaseName: string;
			bucket: string;
		};
		path: string;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const getNode = createNodeDescriptor({
	type: "get",
	defaultLabel: "Get",
	fields: [
		{
			key: "connection",
			label: "Firebase Auth",
			type: "connection",
			params: {
				connectionType: "google-firebase-connection",
				required: true
			}
		},
		{
			key: "path",
			label: "Path",
			description: "The database bash to the data",
			defaultValue: "users/{{input.userId}}",
			type: "cognigyText",
			params: {
				required: true
			}
		},
		{
			key: "storeLocation",
			type: "select",
			label: "Where to store the result",
			defaultValue: "input",
			params: {
				options: [
					{
						label: "Input",
						value: "input"
					},
					{
						label: "Context",
						value: "context"
					}
				],
				required: true
			},
		},
		{
			key: "inputKey",
			type: "cognigyText",
			label: "Input Key to store Result",
			defaultValue: "firebase",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "firebase",
			condition: {
				key: "storeLocation",
				value: "context",
			}
		},
	],
	sections: [
		{
			key: "storage",
			label: "Storage Option",
			defaultCollapsed: true,
			fields: [
				"storeLocation",
				"inputKey",
				"contextKey",
			]
		}
	],
	form: [
		{ type: "field", key: "connection" },
		{ type: "field", key: "path" },
		{ type: "field", key: "value" },
		{ type: "section", key: "storage" },
	],
	appearance: {
		color: "#FFCB2B"
	},
	function: async ({ cognigy, config }: IGetParams) => {
		const { api } = cognigy;
		const { path, connection, storeLocation, contextKey, inputKey } = config;
		const { apiKey, projectId, bucket, databaseName } = connection;

		// set the firebase configuration
		const firebaseConfig = {
			apiKey,
			authDomain: `${projectId}.firebaseapp.com`,
			databaseURL: `https://${databaseName}.firebaseio.com`,
			storageBucket: `${bucket}.appspot.com`
		};

		try {
			// authentication
			firebase.initializeApp(firebaseConfig);
			// get a reference to the database service
			const database = firebase.database();
			// set the data
			const response = await database.ref(path).once('value');

			if (storeLocation === "context") {
				api.addToContext(contextKey, response.val(), "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, response.val());
			}
		} catch (error) {
			if (storeLocation === "context") {
				api.addToContext(contextKey, error.message, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, error.message);
			}
		}
	}
});