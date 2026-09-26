import { z } from "zod";

import type {
	ExtractedMemoryCandidate,
	MemoryCandidate,
	MemorySource,
	MemoryValue,
	UserMemory,
} from "../memory/memory.types";

export const ContactTimeSchema = z.enum([
	"morning",
	"afternoon",
	"evening",
]);

export const MemorySourceSchema = z.enum([
	"user_explicit",
	"user_inferred",
	"tool_result",
	"system",
]) satisfies z.ZodType<MemorySource>;

export function createMemoryValueSchema<T>(valueSchema: z.ZodType<T>) {
	return z.strictObject({
		value: valueSchema,
		confidence: z.number().min(0).max(1),
		source: MemorySourceSchema,
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
	}) satisfies z.ZodType<MemoryValue<T>>;
}

export const ContactTimeMemoryValueSchema =
	createMemoryValueSchema(ContactTimeSchema);

export const UserMemorySchema = z.strictObject({
	userId: z.string().trim().min(1, "userId 不能为空"),
	name: z.string().trim().min(1).optional(),
	interests: z.array(z.string().trim().min(1)).optional(),
	preferences: z
		.strictObject({
			contactTime: ContactTimeMemoryValueSchema.optional(),
		})
		.optional(),
	objections: z.array(z.string().trim().min(1)).optional(),
}) satisfies z.ZodType<UserMemory>;

export const MemoryDatabaseSchema = z.record(z.string(), UserMemorySchema);

export const MemoryCandidateSchema = z.strictObject({
	type: z.enum(["identity", "preference", "interest", "objection"]),
	key: z.string().trim().min(1, "Memory key 不能为空"),
	value: z.string().trim().min(1, "Memory value 不能为空"),
	confidence: z.number().min(0).max(1),
	source: MemorySourceSchema,
}) satisfies z.ZodType<MemoryCandidate>;

export const MemoryCandidatesSchema = z.array(MemoryCandidateSchema);

export const ExtractedMemoryCandidateSchema = MemoryCandidateSchema.omit({
	source: true,
}) satisfies z.ZodType<ExtractedMemoryCandidate>;

export const MemoryExtractionResultSchema = z.strictObject({
	candidates: z.array(ExtractedMemoryCandidateSchema),
});
