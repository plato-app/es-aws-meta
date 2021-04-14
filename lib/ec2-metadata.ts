/**
 * Retrieve EC2 instance metadata
 * @see https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instancedata-data-retrieval.html
 */
import { fetch } from "./util";

/** EC2 metadata endpoint */
const EC2MetaLocation = "http://169.254.169.254/latest/meta-data";

/** Get the local IP v4 of this EC2 instance */
export async function getEC2LocalIPv4(): Promise<string> {
	return await fetch(`${EC2MetaLocation}/local-ipv4`);
}
