interface ILocation {
	city: string;
	country: string;
	latitude: number;
	longitude: number;
}

export interface IStation {
	empty_slots?: number;
	extra?: {
		address: string;
		banking: boolean;
		bonus: boolean;
		last_update: number;
		slots: number;
		status: string;
		uid: number
	};
	free_bikes?: number;
	id: string;
	latitude: number;
	longitude: number;
	name?: string;
	timestamp?: Date;
}

export interface IStations {
	company?: string[];
	href?: string;
	id: string;
	license?: {
		name: string;
		url: string;
	};
	location?: ILocation;
	name?: string;
	source?: string;
	stations: IStation[];
}

export interface INetwork {
	company?: string[];
	href?: string;
	id: string;
	location?: ILocation;
	name?: string;
}