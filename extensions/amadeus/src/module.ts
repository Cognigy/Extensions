import { createExtension } from "@cognigy/extension-tools";
import { amadeusOAuth2Connection } from "./connections/amadeusOAuth2Connection";
import { flightOffersSearchNode, onFoundFlightOffers, onNotFoundFlightOffers } from "./nodes/flightBooking/flightOffersSearch";

export default createExtension({
	nodes: [
		flightOffersSearchNode,
		onFoundFlightOffers,
		onNotFoundFlightOffers
	],
	connections: [
		amadeusOAuth2Connection,
	],
	options: {
		label: "Amadeus"
	}
});