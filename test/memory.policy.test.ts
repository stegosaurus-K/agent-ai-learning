import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { shouldSaveMemory } from "../src/memory/memory.policy";

describe("shouldSaveMemory", () => {
	it("接受达到置信度阈值且字段合法的 Candidate", () => {
		const result = shouldSaveMemory({
			type: "interest",
			key: "topic",
			value: "PLC",
			confidence: 0.8,
			source: "user_explicit",
		});

		assert.equal(result, true);
	});

	it("拒绝低于置信度阈值的 Candidate", () => {
		const result = shouldSaveMemory({
			type: "interest",
			key: "topic",
			value: "PLC",
			confidence: 0.79,
			source: "user_explicit",
		});

		assert.equal(result, false);
	});

	it("拒绝类型和 key 不匹配的 Candidate", () => {
		const result = shouldSaveMemory({
			type: "identity",
			key: "topic",
			value: "张三",
			confidence: 1,
			source: "user_explicit",
		});

		assert.equal(result, false);
	});

	it("拒绝系统不支持的联系时间", () => {
		const result = shouldSaveMemory({
			type: "preference",
			key: "contactTime",
			value: "night",
			confidence: 1,
			source: "user_explicit",
		});

		assert.equal(result, false);
	});
});
