export default function createAttendeesList(attendees: string[]): object[] {

	const list: object[] = [];

	for (const a of attendees) {
		list.push({
			emailAddress: {
				address: a,
				name: "Guest"
			},
			type: "Required"
		});
	}

	return list;
}