const express = require('express')
const bodyParser = require('body-parser');
const poll = require('poll').default
const axios = require('axios')
const rootResponse = require('../assets/rootResponse.json')


const app = express()
const port = 8081

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
	res.json(rootResponse)
});

app.post('/message', (req, res) => {

	// Extract body data
	const { body } = req;
	const { liveAgent, cognigy } = body;
	const { url, headers } = liveAgent;
	const { userId, URLToken, sessionId, apiKey } = cognigy;

	poll(async () => {
		try {
			const messagesResponse = await axios({
				method: 'get',
				url: `${url}/chat/rest/System/Messages`,
				headers: headers
			});

			try {
				messagesResponse.data.messages.forEach(async (message) => {
					if (message.type === "ChatMessage") {
						
						try {
							const response = await axios({
								method: 'post',
								url: `https://api-trial.cognigy.ai/new//v2.0/endpoint/notify?api_key=${apiKey}`,
								data: {
									userId,
									text: message.message.text,
									data: {},
									URLToken,
									sessionId
								}
							})
						} catch (error) {}
					}
				});
			} catch (e){}
		} catch (error) {}
	}, 1000)
});


app.listen(port, () => {
	console.log(`[Salesforce Live Chat] Message Server started`)
})





