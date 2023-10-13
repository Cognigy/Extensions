import { INetwork, IStation, IStations } from '../interfaces/cityBikes';
import axios from 'axios';

// Get nearest station from CityBikes API
export const getStation = async (lat: number, lon: number): Promise<IStation> => {

	let networks = await getBikesNetworks();
	let stations = await getNetworkStations(networks, lat, lon);

	// Get nearest stations from nearest network
	let station = nearestStation(stations, lat, lon);
	return station;
};

// Get Networks from CityBikes API
const getBikesNetworks = async (): Promise<INetwork[]> => {
	try {
		const response = await axios({
			method: 'get',
			url: `https://api.citybik.es/v2/networks`
		});

		return response.data.networks;

	} catch (error) {
		throw new Error(error);
	}
};

// Get Stations of the nearest Network from CityBikes API
const getNetworkStations = async (networks: INetwork[], lat: number, lon: number): Promise<IStations[]> => {

    // Nearest Network
    const network = nearestNetwork(networks, lat, lon);

	try {
		const response = await axios({
			method: 'get',
			url: `https://api.citybik.es/v2/networks/${network.id}`
		});

		return response.data.network;

	} catch (error) {
		throw new Error(error);
	}
};

const nearestNetwork = (networks: INetwork[], lat: number, lon: number): INetwork => {

	let network = networks[0];
	let distance = calcDistanceBetween(network.location.latitude, network.location.longitude, lat, lon);
	for (let index = 1; index < networks.length; index++) {
		const dist = calcDistanceBetween(networks[index].location.latitude, networks[index].location.longitude, lat, lon);
		if (dist < distance) {
			network = networks[index];
			distance = dist;
		}
	}
    return network;
};

const nearestStation = (network, lat: number, lon: number): IStation => {
	let station = network.stations[0];
	let distance = calcDistanceBetween(station.latitude, station.longitude, lat, lon);
	for (let index = 1; index < network.stations.length; index++) {
		const dist = calcDistanceBetween(network.stations[index].latitude, network.stations[index].longitude, lat, lon);
		if (dist < distance) {
			station = network.stations[index];
			distance = dist;
		}
	}
    return station;
};

function calcDistanceBetween(lat1: number, lon1: number, lat2: number, lon2: number): number {
	// Radius of the earth in: 1.609344 miles, 6371 km | let R = (6371 / 1.609344);
	const R = 3958.7558657440545;
	// Radius of earth in Miles
	const dLat = toRad(lat2 - lat1);
	const dLon = toRad(lon2 - lon1);
	const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	const d = R * c;
	return d;
}

function toRad(Value: number): number {
	/** Converts numeric degrees to radians */
	return Value * Math.PI / 180;
}