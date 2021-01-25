import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import nodemailer = require('nodemailer');
import axios from 'axios';
const https = require('https');

export interface ISendTranscriptMailParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            host: string;
            port: string;
            security: string;
            username: string;
            password: string;
            audioCodesUsername: string;
            audioCodesPassword: string;
            audioCodesBaseUrl: string;
        };
        fromName: string,
        fromEmail: string,
        to: string,
        subject: string,
        message: string
        targetId: string;
        callId: string;
        sysCallId: string;
        startTime: string;
        endTime: string;
        storeLocation: string;
        contextKey: string;
        inputKey: string;
    };
}
export const sendTranscriptMailNode = createNodeDescriptor({
    type: "sendTranscriptMail",
    defaultLabel: "Send Transcript Mail",
    fields: [
        {
            key: "connection",
            label: "SMTP Connection",
            type: "connection",
            params: {
                connectionType: "audiocodes",
                required: true
            }
        },
        {
            key: "fromName",
            label: "Sender Name",
            type: "cognigyText",
            params: {
                required: true
            }
        },
        {
            key: "fromEmail",
            label: "Sender E-Mail",
            type: "cognigyText",
            params: {
                required: true
            }
        },
        {
            key: "to",
            label: "Receiver E-Mail",
            type: "cognigyText",
            params: {
                required: true
            }
        },
        {
            key: "subject",
            label: "Subject",
            type: "cognigyText",
            params: {
                required: true
            }
        },
        {
            key: "message",
            label: "Message",
            type: "text",
            params: {
                required: true,
                multiline: true,
                placeholder: `Hello,

How are you today?

Best Regards,
Cognigy
				`
            }
        },
        {
            key: "attachmentName",
            label: "Name",
            type: "cognigyText",
            params: {
                placeholder: "myFile.pdf",
                required: false
            }
        },
        {
            key: "attachmentUrl",
            label: "Url",
            type: "cognigyText",
            params: {
                placeholder: "https://www.website.com/myFile.pdf",
                required: false
            }
        },
        {
            key: "targetId",
            label: "Target ID",
            type: "cognigyText",
            defaultValue: "105",
            params: {
                required: true
            }
        },
        {
            key: "callId",
            label: "Select Call ID",
            type: "select",
            defaultValue: "sysCallId",
            params: {
                required: true,
                options: [
                    {
                        label: "System Call ID",
                        value: "sysCallId"
                    },
                    {
                        label: "Time",
                        value: "time"
                    }
                ]
            }
        },
        {
            key: "sysCallId",
            label: "System Call ID",
            type: "cognigyText",
            defaultValue: "{{input.sessionId}}",
            params: {
                required: true
            },
            condition: {
                key: "callId",
                value: "sysCallId"
            }
        },
        {
            key: "startTime",
            label: "Minimum Start Time",
            description: "ISO Date",
            type: "cognigyText",
            defaultValue: "",
            params: {
                required: true
            },
            condition: {
                key: "callId",
                value: "time"
            }
        },
        {
            key: "endTime",
            label: "Minimum Release Time",
            description: "ISO Date",
            type: "cognigyText",
            defaultValue: "",
            params: {
                required: true
            },
            condition: {
                key: "callId",
                value: "time"
            }
        },
        {
            key: "storeLocation",
            type: "select",
            label: "Where to store the result",
            defaultValue: "input",
            params: {
                options: [
                    {
                        label: "Input",
                        value: "input"
                    },
                    {
                        label: "Context",
                        value: "context"
                    }
                ],
                required: true
            },
        },
        {
            key: "inputKey",
            type: "cognigyText",
            label: "Input Key to store Result",
            defaultValue: "cognigy",
            condition: {
                key: "storeLocation",
                value: "input",
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: "Context Key to store Result",
            defaultValue: "cognigy",
            condition: {
                key: "storeLocation",
                value: "context",
            }
        },
    ],
    sections: [
        {
            key: "storage",
            label: "Storage Option",
            defaultCollapsed: true,
            fields: [
                "storeLocation",
                "inputKey",
                "contextKey",
            ]
        },
        {
            key: "emailConfig",
            label: "E-Mail Configuration",
            defaultCollapsed: false,
            fields: [
                "fromName",
                "fromEmail",
                "to",
                "subject",
                "message"
            ]
        },
        {
            key: "audiocodesConfig",
            label: "AudioCodes Configuration",
            defaultCollapsed: false,
            fields: [
                "targetId",
                "callId",
                "sysCallId",
                "startTime",
                "endTime"
            ]
        }
    ],
    form: [
        { type: "field", key: "connection" },
        { type: "section", key: "emailConfig" },
        { type: "section", key: "audiocodesConfig" },
        { type: "section", key: "storage" },
    ],
    function: async ({ cognigy, config }: ISendTranscriptMailParams) => {
        const { api } = cognigy;
        let { connection, fromEmail, fromName, to, subject, message, targetId, callId, sysCallId, startTime, endTime, storeLocation, contextKey, inputKey } = config;
        const { host, port, security, username, password, audioCodesBaseUrl, audioCodesPassword, audioCodesUsername } = connection;

        // checking arguments
        if (!fromName) throw new Error('No `from` name defined. This could be the name of your company or your employee, for example.');
        if (!fromEmail) throw new Error('No `from` email address defined.');
        if (!to) throw new Error('No `to` email address defined. You can provide a list of email addresses by just adding them like this: test@test.de, mail@mail.de, ...');
        if (!subject) subject = "";
        if (!message) message = "";

        // checking secret information
        if (!host) throw new Error('No email host defined. This could be something like smtp.example.com.');
        if (!port) throw new Error('No email port defined. This could be something like 587 or 465.');
        if (!security) throw new Error('No email security option defined. This could be TLS, STARTTLS or NONE.');
        if (!['TLS', 'STARTTLS', 'NONE'].includes(security.trim().toUpperCase())) {
            throw new Error('Invalid email security option defined. This could be TLS, STARTTLS or NONE.');
        }
        if (!username) throw new Error('No email user defined. This is your email username.');
        if (!password) throw new Error('No email password defined. This is your email password.');

        // create request url
        let url: string;
        if (callId === "sysCallId") {
            url = `${audioCodesBaseUrl}/rs/audiocodes/recorder/calls/info?targetId=${targetId}&sysCallId=${sysCallId}`;
        } else if (callId === "time") {
            url = `${audioCodesBaseUrl}/rs/audiocodes/recorder/calls/info?targetId=${targetId}&minStartTime=${startTime}&maxReleaseTime=${endTime}`;
        }

        const agent = new https.Agent({
            rejectUnauthorized: false
        });

        try {
            const response = await axios({
                method: 'get',
                url,
                headers: {
                    'Accept': '*/*'
                },
                auth: {
                    username: audioCodesUsername,
                    password: audioCodesPassword
                },
                httpsAgent: agent
            });

            // get location information from xml response body
            const regexLocation = /file:\S+.wav/gm;
            const regexLocationMatches = response.data.match(regexLocation);
            // get starttime information from xml response body
            const regexStartTime = /\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d.\d\d\d\w/gm;
            const regexStartTimeMatches = response.data.match(regexStartTime);


            let xmlBody = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
			 <mediaDescription xmlns='com:audiocodes:recorder' encoding="OPUS" fileFormat="webm">
				 <tracks>
					 <trackInfo>
						 <mediaInfo>
							 <location>${regexLocationMatches[0]}</location>
							 <startTime>${regexStartTimeMatches[0]}</startTime>
							 <direction>RECEIVE</direction>
						 </mediaInfo>
					 </trackInfo>
					 <trackInfo>
						 <mediaInfo>
							 <location>${regexLocationMatches[1]}</location>
							 <startTime>${regexStartTimeMatches[1]}</startTime>
							 <direction>TRANSMIT</direction>
						 </mediaInfo>
					 </trackInfo>
				 </tracks>
			 </mediaDescription>`;

            try {

                const fileResponse = await axios({
                    method: 'post',
                    url: `${audioCodesBaseUrl}/rs/audiocodes/recorder/media`,
                    headers: {
                        'Accept': '*/*',
                        'Content-Type': 'application/xml'
                    },
                    auth: {
                        username: audioCodesUsername,
                        password: audioCodesPassword
                    },
                    httpsAgent: agent,
                    data: xmlBody,
                    responseType: 'arraybuffer'
                });

                // create data url in order to use wav file
                const dataUrl = `data:audio/*;base64,${Buffer.from(fileResponse.data).toString('base64')}`;

                try {

                    // create reusable transporter object using the default SMTP transport
                    const transporter = nodemailer.createTransport({
                        // @ts-ignore
                        host,
                        port,
                        secure: security === 'TLS',
                        ignoreTLS: security === 'NONE',
                        auth: {
                            user: username,
                            pass: password
                        }
                    });

                    // send mail with defined transport object
                    const info = await transporter.sendMail({
                        from: `"${fromName}" <${fromEmail}>`,
                        to,
                        subject,
                        html: message,
                        attachments: [
                            {
                                filename: `recording.wav`,
                                content: fileResponse.data
                            },
                        ]
                    });

                    if (storeLocation === "context") {
                        api.addToContext(contextKey, `Message sent: ${info.messageId}`, "simple");
                    } else {
                        // @ts-ignore
                        api.addToInput(inputKey, `Message sent: ${info.messageId}`);
                    }
                } catch (error) {
                    if (storeLocation === "context") {
                        api.addToContext(contextKey, error, "simple");
                    } else {
                        // @ts-ignore
                        api.addToInput(inputKey, error);
                    }
                }
            } catch (error) {
                if (storeLocation === "context") {
                    api.addToContext(contextKey, error.message, "simple");
                } else {
                    // @ts-ignore
                    api.addToInput(inputKey, error.message);
                }
            }
        } catch (error) {
            if (storeLocation === "context") {
                api.addToContext(contextKey, error.message, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, error.message);
            }
        }
    }
});