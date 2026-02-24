/**
 * Logs a message with a specific format.
 */
export const logMessage = (
	message: string,
	traceId: string = "extension-sharepoint",
    level: string = "info"
): void => {
	console.log(
		JSON.stringify({
			level: level,
			time: new Date().toISOString(),
			message: message,
			meta: {},
			traceId: traceId,
		}),
	);
};
