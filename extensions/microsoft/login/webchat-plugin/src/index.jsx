import * as React from 'react';
import MicrosoftLogin from "react-microsoft-login";


const MSLogin = (props) => {

	// get info from Cogngiy data
	const { message, onSendMessage } = props;
	const { data } = message;
	const { _plugin } = data;
	let { clientId, redirectUri, scope, buttonTheme, debug } = _plugin;

	const loginHandler = (err, data) => {
		if (err) {
		console.error(err)
		}

		console.log(data)
	};

	return (
		<div style={{
			display: "flex",
			justifyContent: "center",
			alignItems: "center"
		}}>
			<MicrosoftLogin
				debug={debug}
				clientId={clientId}
				authCallback={loginHandler}
				buttonTheme={buttonTheme}
				redirectUri={redirectUri}
				graphScopes={scope}
			/>
		</div>

	);

}

const microsoftLoginPlugin = {
	match: 'microsoft-auth',
	component: MSLogin,
	options: {
		fullwidth: true
	}
}

if (!window.cognigyWebchatMessagePlugins) {
	window.cognigyWebchatMessagePlugins = []
}

window.cognigyWebchatMessagePlugins.push(microsoftLoginPlugin);