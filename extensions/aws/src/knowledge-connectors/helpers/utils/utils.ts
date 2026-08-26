/**
 * Logs a message with a specific format.
 */
export const logMessage = (
	message: string,
	level: string = "info",
	traceId: string = "extension-s3"
): void => {
	console.info(
		JSON.stringify({
			level: level,
			time: new Date().toISOString(),
			message: message,
			meta: {},
			traceId: traceId,
		}),
	);
};