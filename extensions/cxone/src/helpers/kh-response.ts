interface KnowledgeHubResponse {
    answer: string | null;
    links: string[];
    contextRefId: string;
}

export default function formatKnowledgeHubResponse(knowledheHubResponse: any, api: any, responseCode: number): KnowledgeHubResponse {
    const responses = {
        notFound: "I'm unable to find that information for you.",
        retry: "Something's not working. Let's retry.",
        specifyLonger: "Could you please provide more details?",
        specifyShorter: "Could you please make your question shorter?"
    };
    // Parse if it's a string
    if (typeof knowledheHubResponse === "string") {
        try {
            knowledheHubResponse = JSON.parse(knowledheHubResponse);
        } catch (e) {
            api.log("error", `getKnowledgeHubInfo -> formatKnowledgeHubResponse: Failed to parse faqResponse: ${e}`);
            knowledheHubResponse = null;
        }
    }
    const toReturn = { answer: null, links: [], images: [], citations: [], contextRefId: "empty" };
    try {
        if (!knowledheHubResponse) throw new Error("Invalid knowledheHubResponse object");
        if ([200, 302].includes(responseCode)) {
            const messages = knowledheHubResponse.kbAnswers;
            const firstKbAnswer = messages?.kbCompletions?.[0]?.kbCompletion;
            const kbLinks = messages?.kbLinks?.map(item => item.link) || [];
            const kbImages = messages?.kbImages?.map(item => item.link || item.uri) || [];
            const kbCitations =
            messages?.kbCompletions?.[0]?.citations?.flatMap(c =>
                c?.metadata?.map(m => m?.Uri)
            ) || [];
            toReturn.answer = firstKbAnswer || responses.notFound;
            toReturn.links = kbLinks;
            toReturn.images = kbImages;
            toReturn.citations = kbCitations;
            toReturn.contextRefId = messages?.conversationContextRefId || "empty";
        } else if ([404, 418, 250, 251].includes(responseCode)) {
            toReturn.answer = responses.notFound;
        } else if ([406, 411].includes(responseCode)) {
            toReturn.answer = responses.specifyLonger;
        } else if (responseCode === 413) {
            toReturn.answer = responses.specifyShorter;
        } else {
            toReturn.answer = responses.retry;
        }
    } catch (e) {
        api.log("error", `getKnowledgeHubInfo -> formatKnowledgeHubResponse: Error: ${e}`);
        toReturn.answer = responses.retry;
    }
    return toReturn;
}