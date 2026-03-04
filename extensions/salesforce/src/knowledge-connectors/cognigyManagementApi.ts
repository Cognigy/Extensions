/**
 * Thin wrapper around the Cognigy Management REST API.
 *
 * Provides listing and deletion of knowledge sources — operations not
 * exposed by the @cognigy/extension-tools SDK — for incremental sync.
 *
 * Auth: X-API-Key header (from Profile → API Keys in Cognigy.AI UI).
 */

import axios from "axios";

export interface ManagedSource {
    _id: string;
    name: string;
    description?: string;
}

const REQUEST_TIMEOUT = 30_000;

/**
 * List all knowledge sources in a store, paginating automatically.
 *
 * GET {apiUrl}/v2.0/knowledgestores/{storeId}/knowledgesources?limit=100&skip=0
 */
export async function listKnowledgeSources(
    apiUrl: string,
    apiKey: string,
    storeId: string,
): Promise<ManagedSource[]> {
    const all: ManagedSource[] = [];
    const limit = 100;
    let skip = 0;

    while (true) {
        const res = await axios.get<{ data: ManagedSource[] }>(
            `${apiUrl}/v2.0/knowledgestores/${storeId}/knowledgesources`,
            {
                params: { limit, skip },
                headers: { "X-API-Key": apiKey },
                timeout: REQUEST_TIMEOUT,
                validateStatus: (s) => s >= 200 && s < 300,
            },
        );

        const page = res.data?.data ?? [];
        all.push(...page);

        if (page.length < limit) break;
        skip += limit;
    }

    return all;
}

/**
 * Delete a single knowledge source by its ID.
 *
 * DELETE {apiUrl}/v2.0/knowledgestores/{storeId}/knowledgesources/{sourceId}
 */
export async function deleteKnowledgeSourceById(
    apiUrl: string,
    apiKey: string,
    storeId: string,
    sourceId: string,
): Promise<void> {
    await axios.delete(
        `${apiUrl}/v2.0/knowledgestores/${storeId}/knowledgesources/${sourceId}`,
        {
            headers: { "X-API-Key": apiKey },
            timeout: REQUEST_TIMEOUT,
            validateStatus: (s) => s >= 200 && s < 300,
        },
    );
}
