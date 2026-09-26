import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { mergeMemory } from "../src/memory/memory.merger";
import type { UserMemory } from "../src/memory/memory.types";

const oldMemory: UserMemory = {
	userId: "customer_001",
	name: "张三",
	interests: ["PLC"],
	preferences: {
		contactTime: {
			value: "afternoon",
			confidence: 0.9,
			source: "user_explicit",
			createdAt: "2026-09-01T10:00:00.000Z",
			updatedAt: "2026-09-01T10:00:00.000Z",
		},
	},
	objections: ["担心就业"],
};

describe("mergeMemory", () => {
	it("追加新的兴趣，并且不修改旧 Memory", () => {
		const result = mergeMemory(oldMemory, {
			type: "interest",
			key: "topic",
			value: "工业机器人课程",
			confidence: 1,
			source: "user_explicit",
		});

		assert.deepEqual(result.interests, ["PLC", "工业机器人课程"]);
		assert.deepEqual(oldMemory.interests, ["PLC"]);
	});

	it("不会重复追加已经存在的兴趣", () => {
		const result = mergeMemory(oldMemory, {
			type: "interest",
			key: "topic",
			value: "PLC",
			confidence: 1,
			source: "user_explicit",
		});

		assert.deepEqual(result.interests, ["PLC"]);
		assert.strictEqual(result, oldMemory);
	});

	it("使用新的联系时间覆盖旧偏好", () => {
		const result = mergeMemory(
			oldMemory,
			{
				type: "preference",
				key: "contactTime",
				value: "evening",
				confidence: 1,
				source: "user_explicit",
			},
			new Date("2026-09-27T10:00:00.000Z"),
		);

		assert.deepEqual(result.preferences?.contactTime, {
			value: "evening",
			confidence: 1,
			source: "user_explicit",
			createdAt: "2026-09-01T10:00:00.000Z",
			updatedAt: "2026-09-27T10:00:00.000Z",
		});
		assert.equal(oldMemory.preferences?.contactTime?.value, "afternoon");
	});

	it("追加新的顾虑", () => {
		const result = mergeMemory(oldMemory, {
			type: "objection",
			key: "concern",
			value: "担心没有基础",
			confidence: 1,
			source: "user_explicit",
		});

		assert.deepEqual(result.objections, ["担心就业", "担心没有基础"]);
	});

	it("低权威来源不能覆盖用户明确表达的联系偏好", () => {
		const result = mergeMemory(oldMemory, {
			type: "preference",
			key: "contactTime",
			value: "evening",
			confidence: 1,
			source: "user_inferred",
		});

		assert.strictEqual(result, oldMemory);
	});

	it("拒绝不符合 Policy 的 Candidate", () => {
		const result = mergeMemory(oldMemory, {
			type: "identity",
			key: "name",
			value: "李四",
			confidence: 0.5,
			source: "user_explicit",
		});

		assert.strictEqual(result, oldMemory);
	});
});
