import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

export interface IStartAuthenticationParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			clientId: string;
			clientSecret: string;
		};
		redirectUri: string;
		scope: string;
		debug: boolean;
		buttonTheme: string;
	};
}
export const startAuthenticationNode = createNodeDescriptor({
	type: "startAuthentication",
	defaultLabel: "Start Authentication",
	fields: [
		{
			key: "connection",
			label: "Azure Connection",
			type: "connection",
			params: {
				connectionType: "login",
				required: true
			}
		},
		{
			key: "redirectUri",
			label: "Redirect URL",
			description: "The url which should be triggered after user is logged in with microsoft.",
			type: "cognigyText",
			defaultValue: "https://localhost:8080/auth-callback.html",
			params: {
				required: true,
			},
		},
		{
			key: "scope",
			label: "Scope",
			description: "For example user.read",
			type: "textArray",
			defaultValue: ["user.read", "calendars.readWrite"]
		},
		{
			key: "buttonTheme",
			label: "Login Button Theme",
			description: "Select the theme of the login button that should be displayed in the webchat",
			type: "select",
			defaultValue: "light",
			params: {
				options: [
					{
						label: "Light",
						value: "light"
					},
					{
						label: "Dark",
						value: "dark"
					},
					{
						label: "Light Short",
						value: "light_short"
					},
					{
						label: "Dark Short",
						value: "dark_short"
					}
				]
			}
		},
		{
			key: "debug",
			label: "Debug Mode",
			description: "Shows more details about the login process in the webbrowser console",
			type: "toggle",
			defaultValue: false
		},
	],
	sections: [
		{
			key: "advanced",
			label: "Adcanced",
			fields: [
				"debug"
			],
			defaultCollapsed: true
		}
	],
	form: [
		{ type: "field", key: "connection" },
		{ type: "field", key: "redirectUri" },
		{ type: "field", key: "scope" },
		{ type: "field", key: "buttonTheme" },
		{ type: "section", "key": "advanced"}
	],
	function: async ({ cognigy, config }: IStartAuthenticationParams) => {
		const { api } = cognigy;
		const { redirectUri, scope, debug, connection, buttonTheme } = config;
		const { clientId, clientSecret } = connection;

		/* trigger the microsoft login webchat plugin */
		api.output('', {
			_plugin: {
				type: 'microsoft-auth',
				clientId,
				redirectUri,
				scope,
				buttonTheme,
				debug
			}
		});

	}
});