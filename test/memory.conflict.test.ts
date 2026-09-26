import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { resolveConflict } from "../src/memory/memory.conflict";
import type { MemoryValue } from "../src/memory/memory.types";

const oldMemory: MemoryValue<"afternoon" | "evening"> = {
	value: "afternoon",
	confidence: 0.9,
	source: "user_inferred",
	createdAt: "2026-09-01T10:00:00.000Z",
	updatedAt: "2026-09-01T10:00:00.000Z",
};

describe("resolveConflict", () => {
	it("权威性更高的新来源覆盖旧 Memory", () => {
		const result = resolveConflict(
			oldMemory,
			{
				type: "preference",
				key: "contactTime",
				value: "evening",
				confidence: 0.98,
				source: "user_explicit",
			},
			new Date("2026-09-27T10:00:00.000Z"),
		);

		assert.deepEqual(result, {
			value: "evening",
			confidence: 0.98,
			source: "user_explicit",
			createdAt: "2026-09-01T10:00:00.000Z",
			updatedAt: "2026-09-27T10:00:00.000Z",
		});
	});

	it("权威性更低的新来源不能覆盖旧 Memory", () => {
		const explicitMemory: MemoryValue<"afternoon" | "evening"> = {
			...oldMemory,
			source: "user_explicit",
		};

		const result = resolveConflict(explicitMemory, {
			type: "preference",
			key: "contactTime",
			value: "evening",
			confidence: 1,
			source: "user_inferred",
		});

		assert.strictEqual(result, explicitMemory);
	});

	it("来源权威性相同时，较新的 Candidate 覆盖旧值", () => {
		const result = resolveConflict(
			oldMemory,
			{
				type: "preference",
				key: "contactTime",
				value: "evening",
				confidence: 0.95,
				source: "user_inferred",
			},
			new Date("2026-09-27T10:00:00.000Z"),
		);

		assert.equal(result.value, "evening");
		assert.equal(result.updatedAt, "2026-09-27T10:00:00.000Z");
	});
});
