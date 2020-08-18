# Cognigy Extension

This Extension provides basic nodes to exstand the Cognigy core features.

## Node: Send Email With Attachment

This node lets you send emails with attached files, like for example PDF, JPEG or Word files. To send an actual mail, the following arguments have to be defined:

- **Connection**:
You need to create a Connection. Name is for example 'Email Connection' or something similar. Now you need some Connection keys:
	- Email Server Hostname:
		- key: **host**
		- value: *The STMP host of your Mailserver. Please ask your administrator.*
	- Email Server Port:
		- key: **port**
		- value: The port of your email server; 465 or 587
	- Email Server Security Option:
		- key: **security**
		- value: `TLS`, `STARTTLS` or `NONE`
	- Email Username:
	   - key: **user**
	   - value: *The username of your Email account*
	- Email Password:
		- key: **password**
	   - value: *The password of your Email Account*
- **froomName**: *The name of the sender*
- **fromEmail**: *The email address of the sender*
- **to**: *The emails that should receive your message*
	- You can provide one or more emails by just adding them to the list:
		- `info@cognigy.com,support@cognigy.com,...`
- **subject**: *The email's subject*
- **attachmentName**: *OPTIONAL. The name of your attached file*
	- Something like `file.pdf` if it is a PDF file
- **attachmentUrl**: *If you want to send an attachment, you also have to define the path to the file; the URL*
	- Example: https://path-to-file.pdf
	- **IMPORTANT**: The path to the file has to public and accessable from the outer world!
- **contextStore**: *How to store the result in the Cognigy Context. It's a simple name*
	- Example: `mailResponse`
- **stopOnError**: *Wether to stop the Flow if something went wrong or not*

If everything went well so far, the mail should be sent to the receivers and the node stores a success message into the Cognigy Context:
```json
{
  "mail": "Message sent: <8bcf7879-127a-3f5a-dd22-d1ad2ceb9c83@example.com>"
}
```