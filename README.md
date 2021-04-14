# @plato/aws-meta

Introspects [AWS](https://aws.amazon.com) [EC2](https://aws.amazon.com/ec2/) and [ECS](https://aws.amazon.com/ecs/) metadata from running containers.

## Usage

```ts
import { getEC2LocalIPv4 } from "@plato/aws-meta";

try {
	const ip = await getEC2LocalIPv4();
	// Do something with "ip"
} catch (e) {
	// Failed to get local IP
}
```
