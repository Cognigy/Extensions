# Salesforce Chat Server

This server polls for Live Agent messages and sends them back to the ongoing Cognigy.AI conversation.

```json
{
	"message": "Welcome to the Cognigy Salesforce Live Chat Message Server.",
	"endpoints": [
		{
			"method": "POST",
			"description": "Polls Salesforce for new agent messages and sends them back to the ongoing Cognigy conversation.",
			"path": "/message",
			"headers": {
				"X-API-Key": {
					"description": "The Cognigy API Key",
					"type": "string"
				}
			},
			"body": {
				"liveAgent": {
					"url": {
						"description": "The Salesforce Chat Settings URL.",
						"type": "string"
					},
					"headers": {
						"X-LIVEAGENT-SESSION-KEY": {
							"description": "The Salesforce Chat Session Key.",
							"type": "string"
						},
						"X-LIVEAGENT-AFFINITY": {
							"description": "The Salesforce Chat Session affinity token.",
							"type": "string"
						},
						"X-LIVEAGENT-API-VERSION": "34"
					}
				},
				"cognigy": {
					"apiUrl": {
						"description": "The Cognigy API base URL. E.g. 'https://api-trial.cognigy.ai/new/'",
						"type": "string"
					},
					"userId": {
						"description": "The Cognigy user ID.",
						"type": "string"
					},
					"URLToken": {
						"description": "The Cognigy URL token.",
						"type": "string"
					},
					"sessionId": {
						"description": "The Cognigy session ID.",
						"type": "string"
					}
				}
			}
		}
	]
}
```

## Install

1. `npm ci`
2. `node src/app.js`
3. The server is now deployed on `http://localhost:8081`

## Install with Docker

1. `docker build -t message-server . `
2. `docker run -it -p 8081:8081 message-server`
3. The server is now deployed on `http://localhost:8081`

## Example Request

```js
const axios = require('axios');

try {
    const response = await axios({
        method: 'post',
        url: 'http://localhost:8081/message',
        headers: {
            'X-API-Key': 'Cognigy API Key'
        },
        data: {
            "liveAgent": {
                "url": "https://....salesforceliveagent.com",
                "headers": {
                    "X-LIVEAGENT-SESSION-KEY": {
                        "$cs": {
                            "script": "cc.liveChat.session.key",
                            "type": "string"
                        }
                    },
                    "X-LIVEAGENT-AFFINITY": {
                        "$cs": {
                            "script": "cc.liveChat.session.affinityToken",
                            "type": "string"
                        }
                    },
                    "X-LIVEAGENT-API-VERSION": "34"
                }
            },
            "cognigy": {
                "apiUrl": "https://api-trial.cognigy.ai/new/",
                "userId": {
                    "$cs": {
                        "script": "ci.userId",
                        "type": "string"
                    }
                },
                "URLToken": {
                    "$cs": {
                        "script": "ci.URLToken",
                        "type": "string"
                    }
                },
                "sessionId": {
                    "$cs": {
                        "script": "ci.sessionId",
                        "type": "string"
                    }
                }
            }
        }
    });
} catch (error) {
    console.log(error.message);
}
```