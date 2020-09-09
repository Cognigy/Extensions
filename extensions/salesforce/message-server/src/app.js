const express = require('express');
const bodyParser = require('body-parser');
const poll = require('poll').default;
const axios = require('axios');

// Import the root path JSON response
const rootResponse = require('../assets/rootResponse.json');

// Configure Express
const app = express();
const port = 8081;

// Enable JSON Body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
	res.json(rootResponse);
});

app.post('/message', (req, res) => {

	// Get Header for authentication
	let apiKey = req.header('X-API-Key');
	if (apiKey === undefined || apiKey === '') {
		res.statusCode = 403;
		res.json({
			error: "The header is missing the 'X-API-Key' field."
		});
	}

	// Directly answer Cognigy to prevent Timeouts
	res.sendStatus = 202;
	res.json({
		message: "[Salesforce Live Chat] Message Server started."
	});

	// Extract body data
	const { body } = req;
	const { liveAgent, cognigy } = body;
	const { url, headers } = liveAgent;
	const { userId, URLToken, sessionId, apiUrl } = cognigy;

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
								url: `${apiUrl}v2.0/endpoint/notify?api_key=${apiKey}`,
								data: {
									userId,
									text: message.message.text,
									data: {},
									URLToken,
									sessionId
								}
							});
						} catch (error) {
							res.send(error);
						}
					}
				});
			} catch (e){}
		} catch (error) {
			res.send(error);
		}
	}, 1000)
});


app.listen(port, () => {
	console.log(`[Salesforce Live Chat] Message Server started`)
})





