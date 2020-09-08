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
				messagesResponse.data.messages.forEach((message) => {
					if (message.type === "ChatMessage") {
						console.log(message.message.text);

						axios.post(`https://api-trial.cognigy.ai/new//v2.0/endpoint/notify?api_key=${apiKey}`, {
							headers: {
								'X-API-Key': apiKey,
								'Content-Type': 'application/json'
							},
							data: {
								userId,
								text: message.message.text,
								data: {},
								URLToken,
								sessionId
							}
						}).then((response) => {
							res.json({
								message: response.data
							})
						}).catch((error) => {
							res.json({
								error
							})
						})
					}
				});
			} catch (e){}
		} catch (error) {
			console.log(error)
		}
	}, 1000)
});


app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
})





