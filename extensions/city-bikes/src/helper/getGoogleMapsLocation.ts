import {IGoogleMapsLocation } from '../interfaces/googleMapsLocation';
import axios from 'axios';

export const getGoogleMapsLocation = async (key: string, searchquery: string): Promise<IGoogleMapsLocation> => {
	try {
		const response = await axios({
			method: 'get',
			url: `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchquery)}&key=${key}`
		});

		return {
			location: response.data.results[0]
		};
	} catch (error) {
		throw new Error(error);
	}
};

export const getGoogleMapsLocationFromGeocodes = async (key: string, searchquery: string): Promise<IGoogleMapsLocation> => {
	try {
		const response = await axios({
			method: 'get',
			url: `https://maps.googleapis.com/maps/api/geocode/json?latlng=${encodeURIComponent(searchquery)}&key=${key}`
		});

		return {
			location: response.data.results[0]
		};
	} catch (error) {
		throw new Error(error);
	}
};