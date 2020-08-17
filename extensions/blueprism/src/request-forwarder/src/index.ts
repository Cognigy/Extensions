/* Node modules */
// @ts-ignore
import express from 'express';
import fetch from "node-fetch";

/* Interfaces */
import { IRequestPayload } from "./requestPayload";

const PORT = 8000;
// Define an API Key to secure this endpoint
const API_KEY = process.env.API_KEY || "<YOUR-API-KEY>";

const api = express();
api.use(express.json());

api.get('/', (req, res) => {
	res.send(`Welcome to the request forwarder. Please use the /forward URL.`);
});

api.post('/forward', (req, res) => {
	/** Check for API_KEY presence and validate it */
	const apiKey = req.get('x-api-key');

	if (!apiKey || apiKey !== API_KEY.trim()) {
		return res
			.status(401)
			.send("Unauthorized");
	}

	const body = req.body as IRequestPayload;
	const { bodyToFoward, urlToForward } = body;

	/** rough validation */
	if (!urlToForward || typeof urlToForward !== "string" || urlToForward.length === 0) {
		return res
			.status(400)
			.send("Your request is missing the 'urlToForward' field.");
	}

	if (!bodyToFoward || typeof bodyToFoward !== "object") {
		return res
			.status(400)
			.send("Your request is missing the 'bodyToFoward' field.");
	}

	/** Forward the request */
	const options = {
		method: 'POST',
		body: JSON.stringify(bodyToFoward),
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json'
		}
	};

	/** Send the actual request to the foreign system */
	console.log(`Forwarding to: ${urlToForward}`);
	console.log(`body: ${JSON.stringify(bodyToFoward, undefined, 4)}`)

	fetch(urlToForward, options)
		.then(response => {
			console.log(response.status);
			console.log(response.statusText);

			return response.json()
		})
		.then(json => {
			console.log("The output of the API we forwarded to was:");
			console.log(JSON.stringify(json, undefined, 4));
		})
		.catch(err => {
			console.error(`The API we forwarded to threw an error: ${err}`);
		});

	/** Answer the initial calling request */
	res.sendStatus(202);
});

api.listen(PORT, () => {
	console.log(`Request forwarder is listening on port: ${PORT}`);
});