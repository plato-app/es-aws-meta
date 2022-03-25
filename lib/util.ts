import { get } from "http";
import { getEC2LocalIPv4 } from "./ec2-metadata";
import { inFargateRuntime, getECSTaskV4IP } from "./ecs-metadata";

/** Fetch the runtime IP address from either ECS, EC2, or Fargate **/
export function getInstanceIPV4(): Promise<string> {
	if (inFargateRuntime()) {
		return getECSTaskV4IP()
			.catch((e) => {
				e.message = `could not get fargate container IP: ${e.message}`;
				throw e;
			});
	} else {
		return getEC2LocalIPv4();
	}
}

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
