import * as React from 'react';
import memoize from 'memoize-one';

import { getStyles } from './styles';

// only re-calculate if theme changed
const getStylesMemo = memoize(getStyles);

window.handleMicrosoftAuthCallback = url => {
    cognigyWebchat.sendMesage('', {
        microsoftAuth: {
            code: '',
            sessionState: ''
        }
    })
}

const SignInWithMicrosoft = (props) => {
    const {
        theme,
        message
    } = props;

    const {
        buttonStyles
    } = getStylesMemo(theme);

    const onClick = () => {
        const { clientId, redirectUri, scope, tenant } = message.data._plugin;

        window.open(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURI(redirectUri)}&response_mode=query&scope=${scope}`)
    }

    return (
        <button
            type='button'
            style={buttonStyles}
            onClick={onClick}
        />
    )
}

const dialogPlugin = {
    match: 'microsoft-auth',
    component: SignInWithMicrosoft,
    options: {
        fullwidth: true
    }
}

if (!window.cognigyWebchatMessagePlugins) {
    window.cognigyWebchatMessagePlugins = []
}

window.cognigyWebchatMessagePlugins.push(dialogPlugin);