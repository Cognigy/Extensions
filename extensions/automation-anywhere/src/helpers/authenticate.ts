import axios from 'axios';

export default async function authenticate(deploy: boolean, url: string, username: string, password: string, fileId: string, deviceIds: string[], botVariables: object): Promise<object> {

	let options = {};
	const payload = {
		username,
		password
	};

	try {
		const authenticationResponse = await axios.post(`${url}/v1/authentication`, payload);
		const token = authenticationResponse.data.token;

		if (deploy) {
			options = {
				headers: {
					'X-Authorization': token
				},
				body: {
					fileId,
					deviceIds,
					runWithRdp: false,
					botVariables
				}
			};
		} else {
			options = {
				headers: {
					'X-Authorization': token
				}
			};
		}

	} catch (error) {
		throw new Error(error.message);
	}

	return options;
}
