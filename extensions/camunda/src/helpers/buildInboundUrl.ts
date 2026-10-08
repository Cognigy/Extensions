/**
 * Builds the Camunda SaaS inbound webhook connector URL, e.g.
 * https://bru-2.connectors.camunda.io/<clusterId>/inbound/<inboundId>
 */
export const buildInboundUrl = (region: string, clusterId: string, inboundId: string): string => {
	const cleanRegion = region.trim().toLowerCase();
	const cleanClusterId = clusterId.trim().replace(/^\/+|\/+$/g, "");
	const cleanInboundId = inboundId.trim().replace(/^\/+|\/+$/g, "");

	return `https://${cleanRegion}.connectors.camunda.io/${cleanClusterId}/inbound/${cleanInboundId}`;
};
