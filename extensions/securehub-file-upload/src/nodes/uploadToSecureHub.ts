import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
const https = require('https');
const { DateTime } = require('luxon');

export interface IUploadToSecureHubParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			username: string;
			password: string;
		};
		folderName: string;
		baseUrl: string;
		rejectUnauthCert: boolean;
		defineLinkExpiration: boolean;
		daysExpiration: number;
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
		},
		{
			key: "defineLinkExpiration",
			label: {
				default: "Define Link Expiration",
				deDE: "Ablauf des Links festlegen"
			},
			description: {
				default: "Customize how many days the link should remain active?",
				deDE: "Anpassen wie viele Tage der Link aktiv bleiben soll.",
			},
			type: "toggle",
			defaultValue: false
		},
		{
			key: "daysExpiration",
			label: {
				default: "Link Expiration (in Days)",
				deDE: "Linkablauf (in Tagen)"
			},
			type: "number",
			defaultValue: 14,
			params: {
				max: 90
			},
			condition: {
				key: "defineLinkExpiration",
				value: true
			}
		},
	],
	form: [
		{ type: "field", key: "connection" },
		{ type: "field", key: "folderName" },
		{ type: "field", key: "baseUrl" },
		{ type: "field", key: "rejectUnauthCert" },
		{ type: "field", key: "defineLinkExpiration" },
		{ type: "field", key: "daysExpiration" }

	],
	appearance: {
		color: "#c80f2e"
	},
	function: async ({ cognigy, config }: IUploadToSecureHubParams) => {
		const { api } = cognigy;
		const { connection, folderName, baseUrl, rejectUnauthCert, defineLinkExpiration, daysExpiration } = config;
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

		let linkExpirationDate;
		if (defineLinkExpiration === true) {
			// Get the current date and time using Luxon
			let currentDate = DateTime.utc();

			// Add the specified number of days
			let newDate = currentDate.plus({ days: daysExpiration });

			// Format the date in the desired format: YYYY-MM-DDTHH:mm:ssZ (without milliseconds)
			linkExpirationDate = newDate.toFormat('yyyy-MM-dd\'T\'HH:mm:ss\'Z\'');
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
					rejectCertificate: rejectUnauthCert,
					defineLinkExpiration,
					linkExpirationDate
				}
			});
		} catch (error) {
			console.log("error", error);
			api.addToContext("error", error, "simple");
		}
	}
});