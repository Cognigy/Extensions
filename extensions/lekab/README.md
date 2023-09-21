# Cognigy.AI Integration with Lekab Communication Systems

This repository provides an integration between Cognigy.AI and Lekab, a powerful communication platform (https://www.lekab.com). The integration allows you to seamlessly connect Cognigy.AI to Lekab's services, enabling efficient communication through SMS.

## Lekab Connection

Before using this extension, you need to establish a Lekab Connection and pass it to the designated Node. To set up the connection, you must define the following key:

- **APIkey**: You can create an API key by visiting [Lekab's application portal](https://app.lekab.com).

## Node: Send SMS (*mandatory fields*)

To send SMS messages using this integration, the following details are required:

- **Lekab Connection**: Provide the API key obtained from the Lekab Connection setup.
- **Sender Number**: The phone number from which the SMS will be sent.
- **Receiver Number**: The recipient's phone number.
- **Message Body**: The content of the SMS.

Upon execution, the node will provide the following response:

```json
"lekab": {
    "accepted": [
        {
            "to": "358401234567",
            "id": "1234567890"
        }
    ],
    "rejected": []
}
