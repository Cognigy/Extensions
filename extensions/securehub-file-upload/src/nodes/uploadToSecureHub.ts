import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
const https = require('https');

export interface IUploadToSecureHubParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			username: string;
			password: string;
		};
		folderName: string;
		baseUrl: string;
		rejectUnauthCert: boolean
	};
}
export const uploadToSecureHubNode = createNodeDescriptor({
	type: "uploadToSecureHub",
	defaultLabel: {
		default: "Upload To SecureHub",
		deDE: "Auf SecureHub hochladen"
	},
	summary: {
		default: "Triggers the process required for the SecureHub upload plugin as well as retrieving the bearer token for the SecureHub API.",
		deDE: "Vereinfacht der SecureHub-Webchat-Plugin-Upload-Prozess und erstellt einen Bearer Token für die SecureHub API."
	},
	fields: [
		{
			key: "connection",
			label: {
				default: "SecureHub Connection",
				deDE: "SecureHub Verbindung"
			},
			type: "connection",
			params: {
				connectionType: "securehub",
				required: true
			}
		},
		{
			key: "folderName",
			label: {
				default: "Folder Name",
				deDE: "Ordnername"
			},
			type: "cognigyText",
			defaultValue: "Test-Folder",
			params: {
				required: true
			}
		},
		{
			key: "baseUrl",
			label: {
				default: "Base URL",
				deDE: "Base URL"
			},
			type: "cognigyText",
			defaultValue: "securehub.example.com",
			params: {
				required: true
			}
		},
		{
			key: "rejectUnauthCert",
			label: {
				default: "Reject Unauthorized Certificates",
				deDE: "Nicht auhorisierte Zertifikate ablehnen"
			},
			description: {
				default: "Should unauthorized certificates from the SecureHub server be rejected? If turned off this will fix the upload process in the event of an expired certificate but might be a security risk.",
				deDE: "Sollten nicht autorisierte Zertifikate vom SecureHub-Server abgelehnt werden? Deaktiviert man dieser Option, behebt es Zertifikatprobleme beim Upload-Vorgang. Achtung: mögliche Sicherheitsrisiko.",
			},
			type: "toggle",
			defaultValue: false
		}
	],
	form: [
		{ type: "field", key: "connection" },
		{ type: "field", key: "folderName" },
		{ type: "field", key: "baseUrl" },
		{ type: "field", key: "rejectUnauthCert" }
	],
	appearance: {
		color: "#c80f2e"
	},
	function: async ({ cognigy, config }: IUploadToSecureHubParams) => {
		const { api } = cognigy;
		const { connection, folderName, baseUrl, rejectUnauthCert } = config;
		const { username, password } = connection;

		const agent = new https.Agent({
			rejectUnauthorized: false
		});

		let tokenUrl = `https://${baseUrl}/api/v1/oauth/token`;

		let data = {
			"username": username,
			"password": password,
			"grant_type": "password"
		};

		const axiosConfig: AxiosRequestConfig = {
			headers: {
				"Content-Type": "application/json"
			}
		};

		if (rejectUnauthCert === false) {
			axiosConfig["httpsAgent"] = agent;
		}

		try {
			const response: AxiosResponse = await axios.post(tokenUrl, data, axiosConfig);
			let bearerToken = response.data.access_token;
			api.say('', {
				_plugin: {
					type: 'securehub-file-upload',
					baseUrl,
					folderName,
					bearerToken,
					rejectCertificate: rejectUnauthCert
				}
			});
		} catch (error) {
			console.log("error", error);
			api.addToContext("error", error, "simple");
		}
	}
});