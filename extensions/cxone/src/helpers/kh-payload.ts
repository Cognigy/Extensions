export default function getKnowledgeHubPayload(businessNumber: string, contactId: string, userUtterance: string, bedrockKbId: string, filters: any, contextRefId: string): any {
    function generateTimestamp(): string {
        const date = new Date();
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        const seconds = String(date.getUTCSeconds()).padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
    }

    function generateGUID(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    const requestBody = {
        "schemaVersion": "1.0.0",
        "timestamp": generateTimestamp(),
        "meta": {
            "tenantId": "443a2ac9-41a7-4549-8534-5b7245992e81",
            "busNumber": businessNumber.trim(),
            "contactNumber": contactId.trim(),
            "interactionUid": "443a2ac9-41a7-4549-8534-5b7245992e81",
            "agentUid": "443a2ac9-41a7-4549-8534-5b7245992e81",
            "assistProfileId": "string",
            "agentContactUid": "443a2ac9-41a7-4549-8534-5b7245992e81",
            "provider": "ECA",
            "customerId": "string"
        },
        "query": {
            "uid": generateGUID(),
            "text": userUtterance?.trim().endsWith("?") ? userUtterance : userUtterance + "?",
            "persona": "I'm a helpful assistant",
            "language": "en-us"
        },
        "kbFiltering": {
            "filters": {}
        },
        "config": {
            "kbAnswers": {
                "answers": {
                    "enabled": true,
                    "maxWords": 100
                },
                "images": {
                    "enabled": true,
                    "maxImages": 5
                },
                "links": {
                    "enabled": true,
                    "maxLinks": 5
                }
            },
            "kbProcessSteps": {
                "enabled": true,
                "maxSteps": 5,
                "maxTitleWords": 8,
                "maxStepWords": 10
            },
            "awsBedrock": {
                "awsBedrockKbId": bedrockKbId ? bedrockKbId.trim() : "",
                "maxKernels": 5,
                "shareable": true
            }
        }
    };

    if (contextRefId && contextRefId !== "empty") {
        (requestBody.kbFiltering as any).conversationContextRefId = contextRefId;
    }
    if (filters) {
        requestBody.kbFiltering.filters = filters;
    }
    return requestBody;
}