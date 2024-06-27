import { createExtension } from "@cognigy/extension-tools";
import { amadeusOAuth2Connection } from "./connections/amadeusOAuth2Connection";
import { flightOffersSearchNode, onFoundFlightOffers, onNotFoundFlightOffers } from "./nodes/flightBooking/flightOffersSearch";
import { onFoundAirports, onNotFoundAirports, searchAirportsNode } from "./nodes/airports/searchAirports";

export default createExtension({
	nodes: [
		flightOffersSearchNode,
		onFoundFlightOffers,
		onNotFoundFlightOffers,

		searchAirportsNode,
		onFoundAirports,
		onNotFoundAirports
	],
	connections: [
		amadeusOAuth2Connection,
	],
	options: {
		label: "Amadeus"
	}
});