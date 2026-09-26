import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { selectMemory } from "../src/memory/memory.selector";
import type { UserMemory } from "../src/memory/memory.types";

const now = new Date("2026-09-27T12:00:00.000Z");

const memory: UserMemory = {
	userId: "customer_001",
	name: "张三",
	interests: ["PLC", "工业机器人课程"],
	preferences: {
		contactTime: {
			value: "evening",
			confidence: 0.98,
			source: "user_explicit",
			createdAt: "2026-09-01T12:00:00.000Z",
			updatedAt: "2026-09-20T12:00:00.000Z",
		},
	},
	objections: ["担心就业", "担心没有编程基础"],
};

describe("selectMemory", () => {
	it("回访任务只选择身份和有效的联系偏好", () => {
		const result = selectMemory(memory, "请按照他的偏好安排明天回访", now);

		assert.deepEqual(result, {
			userId: "customer_001",
			name: "张三",
			preferences: { contactTime: "evening" },
		});
	});

	it("课程任务选择用户兴趣，但不注入无关联系偏好", () => {
		const result = selectMemory(memory, "给我看看相关课程资料", now);

		assert.deepEqual(result, {
			userId: "customer_001",
			name: "张三",
			interests: ["PLC", "工业机器人课程"],
		});
	});

	it("顾虑相关任务选择用户 objections", () => {
		const result = selectMemory(memory, "我之前主要担心什么？", now);

		assert.deepEqual(result, {
			userId: "customer_001",
			name: "张三",
			objections: ["担心就业", "担心没有编程基础"],
		});
	});

	it("不会选择已经过期的联系偏好", () => {
		const staleMemory: UserMemory = {
			...memory,
			preferences: {
				contactTime: {
					...memory.preferences!.contactTime!,
					updatedAt: "2026-01-01T12:00:00.000Z",
				},
			},
		};

		const result = selectMemory(staleMemory, "明天什么时候联系我？", now);

		assert.deepEqual(result, {
			userId: "customer_001",
			name: "张三",
		});
	});

	it("任务与长期信息无关时只保留基本身份", () => {
		const result = selectMemory(memory, "你好", now);

		assert.deepEqual(result, {
			userId: "customer_001",
			name: "张三",
		});
	});
});
