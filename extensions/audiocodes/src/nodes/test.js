const axios = require('axios');
const https = require('https');

async function foo() {

    let targetId = 105;
    let sysCallId = "4c0fcb8f-7624-4ff0-a1d8-0886cdd6f11b";
    let username = "demoallianz";
    let password = "bWhEbgC0mK4e";
    let baseUrl = "https://40.78.53.46"

    
		const agent = new https.Agent({
			rejectUnauthorized: false
		});

		try {
			const response = await axios({
				method: 'get',
				url: `${baseUrl}/rs/audiocodes/recorder/calls/info?targetId=${targetId}&sysCallId=${sysCallId}`,
				headers: {
					'Accept': '*/*'
				},
				auth: {
					username,
					password
				},
				httpsAgent: agent
            });
            

            // get location information from xml response body
            const regexLocation = /file:\S+.wav/gm;
            const regexLocationMatches = response.data.match(regexLocation)
            // get starttime information from xml response body
            const regexStartTime = /\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d.\d\d\d\w/gm;
            const regexStartTimeMatches = response.data.match(regexStartTime)


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
					url: `${baseUrl}/rs/audiocodes/recorder/media`,
					headers: {
						'Accept': '*/*',
						'Content-Type': 'application/xml'
					},
					auth: {
						username,
						password
					},
					httpsAgent: agent,
					data: xmlBody,
					responseType: 'arraybuffer'
				});
	
                console.log(typeof fileResponse.data)

                let dataUrl = `data:audio/*;base64,${Buffer.from(fileResponse.data).toString('base64')}`;
				console.log(dataUrl)
				fs = require('fs');
				fs.writeFile('./recording.wav', fileResponse.data, (error, data) => {
					if (error){
						console.log(error)
					}

					//console.log(data)
				})


			} catch (error) {
                console.error(error.message)
			}
		} catch (error) {
			console.error(error.message)
		}
}

foo()