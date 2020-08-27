import * as Fuse from 'fuse.js';


export default async function fuseSearch(list: any, options: any, pattern: string): Promise<any[]> {
	// @ts-ignore
	const fuse = new Fuse(list, options);
	const result = fuse.search(pattern);
	return result;
}