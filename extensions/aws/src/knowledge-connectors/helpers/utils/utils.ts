/**
 * Logs a message with a specific format.
 */
export const logMessage = (
	message: string,
	traceId: string = "extension-s3",
): void => {
	console.info(
		JSON.stringify({
			level: "info",
			time: new Date().toISOString(),
			message: message,
			meta: {},
			traceId: traceId,
		}),
	);
};