import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
	ContactTimeMemoryValueSchema,
	MemoryCandidateSchema,
	MemoryDatabaseSchema,
	UserMemorySchema,
} from "../src/schemas/memory.schema";

describe("Memory Schema", () => {
	it("接受包含完整 Metadata 的 MemoryValue", () => {
		const result = ContactTimeMemoryValueSchema.parse({
			value: "evening",
			confidence: 0.98,
			source: "user_explicit",
			createdAt: "2026-09-27T10:00:00.000Z",
			updatedAt: "2026-09-27T10:00:00.000Z",
		});

		assert.equal(result.value, "evening");
		assert.equal(result.source, "user_explicit");
	});

	it("拒绝非法的 Memory 来源", () => {
		const result = ContactTimeMemoryValueSchema.safeParse({
			value: "evening",
			confidence: 0.98,
			source: "assistant_guess",
			createdAt: "2026-09-27T10:00:00.000Z",
			updatedAt: "2026-09-27T10:00:00.000Z",
		});

		assert.equal(result.success, false);
	});

	it("拒绝非法的 Metadata 时间格式", () => {
		const result = ContactTimeMemoryValueSchema.safeParse({
			value: "evening",
			confidence: 0.98,
			source: "user_explicit",
			createdAt: "今天",
			updatedAt: "2026-09-27T10:00:00.000Z",
		});

		assert.equal(result.success, false);
	});

	it("接受合法 UserMemory，并清理字符串两侧空格", () => {
		const result = UserMemorySchema.parse({
			userId: "customer_001",
			name: " 张三 ",
			preferences: {
				contactTime: {
					value: "evening",
					confidence: 0.98,
					source: "user_explicit",
					createdAt: "2026-09-27T10:00:00.000Z",
					updatedAt: "2026-09-27T10:00:00.000Z",
				},
			},
		});

		assert.equal(result.name, "张三");
	});

	it("拒绝非法 contactTime", () => {
		const result = UserMemorySchema.safeParse({
			userId: "customer_001",
			preferences: {
				contactTime: {
					value: "night",
					confidence: 0.98,
					source: "user_explicit",
					createdAt: "2026-09-27T10:00:00.000Z",
					updatedAt: "2026-09-27T10:00:00.000Z",
				},
			},
		});

		assert.equal(result.success, false);
	});

	it("拒绝 UserMemory 中未声明的字段", () => {
		const result = UserMemorySchema.safeParse({
			userId: "customer_001",
			age: 30,
		});

		assert.equal(result.success, false);
	});

	it("拒绝超出 0 到 1 范围的 confidence", () => {
		const result = MemoryCandidateSchema.safeParse({
			type: "interest",
			key: "topic",
			value: "PLC",
			confidence: 1.2,
			source: "user_explicit",
		});

		assert.equal(result.success, false);
	});

	it("校验数据库中的每一条 Memory", () => {
		const result = MemoryDatabaseSchema.safeParse({
			customer_001: {
				userId: "customer_001",
				interests: ["PLC", 123],
			},
		});

		assert.equal(result.success, false);
	});
});
