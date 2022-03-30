import { fetch } from "./util";

/** ECS network metadata */
export interface ECSNetworkMetadata {
	NetworkMode: string;
	IPv4Addresses: string | string[];
}

/** ECS container metadata */
export interface ECSContainerMetadata {
	/** The Docker ID for the container. */
	DockerId: string;
	/** The name of the container as specified in the task definition. */
	Name: string;
	/** The name of the container supplied to Docker. The Amazon ECS container agent generates a unique name for the container to avoid name collisions when multiple copies of the same task definition are run on a single instance. */
	DockerName: string;
	/** The image for the container. */
	Image: string;
	/** The SHA-256 digest for the image. */
	ImageID: string;
	/** The desired status for the container from Amazon ECS. */
	DesiredStatus: string;
	/** The known status for the container from Amazon ECS. */
	KnownStatus: string;
	/** The type of the container. Containers that are specified in your task definition are of type NORMAL. You can ignore other container types, which are used for internal task resource provisioning by the Amazon ECS container agent. */
	Type: string;
	/** The network information for the container, such as the network mode and IP address. This parameter is omitted if no network information is defined. */
	Networks: ECSNetworkMetadata[];
}

/**
 * ECS task metadata v3
 * @see https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-metadata-endpoint-v3.html
 */
export interface ECSTaskMetadata {
	/** The Amazon Resource Name (ARN) or short name of the Amazon ECS cluster to which the task belongs. */
	Cluster: string;
	/** The full Amazon Resource Name (ARN) of the task to which the container belongs. */
	TaskARN: string;
	/** The family of the Amazon ECS task definition for the task. */
	Family: string;
	/** The revision of the Amazon ECS task definition for the task. */
	Revision: string;
	/** The desired status for the task from Amazon ECS. */
	DesiredStatus: string;
	/** The known status for the task from Amazon ECS. */
	KnownStatus: string;
	/** The Availability Zone the task is in. */
	AvailabilityZone: string;
	/** A list of container metadata for each container associated with the task. */
	Containers: ECSContainerMetadata[];
}

/** Environment variable storing the ECS metadata URI for v3 */
const ECSMetadataEnvV3 = "ECS_CONTAINER_METADATA_URI";

/** Get ECS task metadata */
export async function getECSTaskMetadata(): Promise<ECSTaskMetadata> {
	const endpoint = process.env[ECSMetadataEnvV3];
	if (endpoint === undefined) {
		throw new Error(`ECS metadata URI not found at ${ECSMetadataEnvV3}`);
	}
	const data = await fetch(`${endpoint}/task`);
	return JSON.parse(data);
}

/** Environment variable storing the ECS metadata URI for v3 */
const ECSContainerMetadataEnvV4 = "ECS_CONTAINER_METADATA_URI_V4";

/** Get the IP for an ECS task running in Fargate **/
export async function getECSTaskV4IP(): Promise<string> {
	return getECSContainerMetadataV4().then((md) => {
		if (md.Networks === undefined || md.Networks.length < 1) {
			throw new Error(`Container metadata did not contain any network information: ${JSON.stringify(md)}`);
		}

		const addresses = md.Networks[0].IPv4Addresses;
		if (Array.isArray(addresses)) {
			if (addresses.length < 1) {
				throw new Error("Container does not have any IP addresses....");
			}
			return addresses[0];
		} else {
			return addresses;
		}

	}).catch((e) => {throw new Error(`Could not get container IP from metadata: ${e.message}`)});
}

/** Get ECS task metadata */
export async function getECSContainerMetadataV4(): Promise<ECSContainerMetadata> {
	const endpoint = process.env[ECSContainerMetadataEnvV4];
	if (endpoint === undefined) {
		throw new Error(`ECS container metadata URI not found at ${ECSContainerMetadataEnvV4}`);
	}
	const data = await fetch(`${endpoint}`);
	return JSON.parse(data);
}

/** Returns whether the running container environment is Fargate **/
export function inFargateRuntime(): boolean {
	return process.env[ECSContainerMetadataEnvV4] !== undefined;
}
