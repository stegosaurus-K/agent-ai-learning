import { z } from "zod";

export const RouteDecisionSchema = z
	.object({
		useMemory: z.boolean(),
		useRAG: z.boolean(),
		allowTools: z.boolean(),
	})
	.strict();

export type RouteDecision = z.infer<typeof RouteDecisionSchema>;
