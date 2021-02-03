import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

// Firebase App (the core Firebase SDK) is always required
import firebase from "firebase/app";

// Add the Firebase services that you want to use
import "firebase/auth";
import "firebase/database";

export interface IUpdateParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			apiKey: string;
			projectId: string;
			databaseName: string;
			bucket: string;
		};
		path: string;
		data: object;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const updateNode = createNodeDescriptor({
	type: "update",
	defaultLabel: "Update",
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
			defaultValue: "/users/",
			type: "cognigyText",
			params: {
				required: true
			}
		},
		{
			key: "data",
			label: "Data",
			type: "json",
			defaultValue: "{}",
			params: {
				required: true,
			},
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
		{ type: "field", key: "child" },
		{ type: "field", key: "data" },
		{ type: "section", key: "storage" },
	],
	appearance: {
		color: "#FFCB2B"
	},
	function: async ({ cognigy, config }: IUpdateParams) => {
		const { api } = cognigy;
		const { path, data, connection, storeLocation, contextKey, inputKey } = config;
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

			let updateData: object = {};
			updateData[path] = data;
			await database.ref().update(updateData);

			if (storeLocation === "context") {
				api.addToContext(contextKey, "success", "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, "success");
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