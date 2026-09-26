import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { updateMemory } from "../src/memory/memory.manager";
import type { UserMemory } from "../src/memory/memory.types";

function createFakeStore(initialMemory: UserMemory | null) {
	let storedMemory = initialMemory;
	let saveCount = 0;

	return {
		store: {
			async loadMemory(): Promise<UserMemory | null> {
				return storedMemory;
			},
			async saveMemory(memory: UserMemory): Promise<void> {
				storedMemory = memory;
				saveCount += 1;
			},
		},
		getStoredMemory: () => storedMemory,
		getSaveCount: () => saveCount,
	};
}

describe("updateMemory", () => {
	it("按顺序合并多个 Candidate，并且只保存一次", async () => {
		const fake = createFakeStore({
			userId: "customer_001",
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
		});

		const result = await updateMemory(
			"customer_001",
			[
				{
					type: "interest",
					key: "topic",
					value: "工业机器人课程",
					confidence: 1,
					source: "user_explicit",
				},
				{
					type: "preference",
					key: "contactTime",
					value: "evening",
					confidence: 1,
					source: "user_explicit",
				},
			],
			fake.store,
		);

		assert.equal(result?.userId, "customer_001");
		assert.deepEqual(result?.interests, ["PLC", "工业机器人课程"]);
		assert.equal(result?.preferences?.contactTime?.value, "evening");
		assert.equal(result?.preferences?.contactTime?.confidence, 1);
		assert.equal(
			result?.preferences?.contactTime?.source,
			"user_explicit",
		);
		assert.equal(
			result?.preferences?.contactTime?.createdAt,
			"2026-09-01T10:00:00.000Z",
		);
		assert.ok(result?.preferences?.contactTime?.updatedAt);
		assert.deepEqual(fake.getStoredMemory(), result);
		assert.equal(fake.getSaveCount(), 1);
	});

	it("没有旧 Memory 时，从 userId 创建新 Memory", async () => {
		const fake = createFakeStore(null);

		const result = await updateMemory(
			"customer_002",
			[
				{
					type: "identity",
					key: "name",
					value: "李四",
					confidence: 1,
					source: "user_explicit",
				},
			],
			fake.store,
		);

		assert.deepEqual(result, {
			userId: "customer_002",
			name: "李四",
		});
		assert.equal(fake.getSaveCount(), 1);
	});

	it("所有 Candidate 都被拒绝时不保存", async () => {
		const oldMemory: UserMemory = {
			userId: "customer_001",
			interests: ["PLC"],
		};
		const fake = createFakeStore(oldMemory);

		const result = await updateMemory(
			"customer_001",
			[
				{
					type: "interest",
					key: "topic",
					value: "工业机器人课程",
					confidence: 0.5,
					source: "user_explicit",
				},
			],
			fake.store,
		);

		assert.strictEqual(result, oldMemory);
		assert.equal(fake.getSaveCount(), 0);
	});

	it("Candidate 与现有 Memory 相同时不重复保存", async () => {
		const oldMemory: UserMemory = {
			userId: "customer_001",
			interests: ["PLC"],
		};
		const fake = createFakeStore(oldMemory);

		const result = await updateMemory(
			"customer_001",
			[
				{
					type: "interest",
					key: "topic",
					value: "PLC",
					confidence: 1,
					source: "user_explicit",
				},
			],
			fake.store,
		);

		assert.strictEqual(result, oldMemory);
		assert.equal(fake.getSaveCount(), 0);
	});
});
