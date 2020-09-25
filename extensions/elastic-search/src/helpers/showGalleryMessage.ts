export default function showGalleryMessage(api: any, results: any[], fallbackText: string): any {
	// Dynamically create the gallery
	let galleryElements = [];

	for (let result of results) {
		galleryElements.push({
			title: result._source.character,
			subtitle: '',
			image_url: '',
			buttons: []
		});
	}

	// Display the created gallery to the user
	api.say('', {
		_cognigy: {
			_fallbackText: fallbackText,
			_default: {
				message: {
					attachment: {
						type: 'template',
						payload: {
							template_type: 'generic',
							elements: galleryElements
						}
					}
				}
			}
		}
	});
}