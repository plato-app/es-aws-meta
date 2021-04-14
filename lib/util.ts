import { get } from "http";

/** Fetch data via HTTP */
export function fetch(url: string): Promise<string> {
	return new Promise((resolve, reject) => {
		get(url, (res) => {
			// Verify response status code
			if (res.statusCode !== 200) {
				res.resume();
				reject(new Error(`Fetch error: ${res.statusCode}`));
				return;
			}
			// Read incoming data
			let data = "";
			res.setEncoding("utf8");
			res.on("data", (chunk) => data += chunk);
			res.on("end", () => resolve(data));
		}).once("error", (err) => reject(err));
	});
}
