export const logger = {
    log: (level: string, context: any, message: string) => {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
        if (context && Object.keys(context).length > 0) {
            console.log('Context:', JSON.stringify(context, null, 2));
        }
    }
};