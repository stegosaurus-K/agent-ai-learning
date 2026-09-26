import { MemoryDatabaseSchema } from "../schemas/memory.schema";

const invalidDatabase = {
	customer_001: {
		userId: "customer_001",
		name: "张三",
		preferences: {
			contactTime: {
				value: "night",
				confidence: 1,
				source: "system",
				createdAt: "2026-09-27T10:00:00.000Z",
				updatedAt: "2026-09-27T10:00:00.000Z",
			},
		},
	},
};

const result = MemoryDatabaseSchema.safeParse(invalidDatabase);

if (result.success) {
	console.log("Memory 校验通过：", result.data);
} else {
	console.log("Memory 校验失败：");

	for (const issue of result.error.issues) {
		console.log(`- ${issue.path.join(".")}: ${issue.message}`);
	}
}
