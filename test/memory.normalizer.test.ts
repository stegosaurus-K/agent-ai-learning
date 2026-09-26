import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
	isContactTime,
	normalizeMemoryCandidate,
} from "../src/memory/memory.normalizer";
import type { MemoryCandidate } from "../src/memory/memory.types";

describe("normalizeMemoryCandidate", () => {
	it("将中文联系时间转换为系统统一值", () => {
		const cases = [
			["早上", "morning"],
			["上午", "morning"],
			["下午", "afternoon"],
			["晚上", "evening"],
			["夜间", "evening"],
		] as const;

		for (const [input, expected] of cases) {
			const result = normalizeMemoryCandidate({
				type: "preference",
				key: "contactTime",
				value: input,
				confidence: 1,
				source: "user_explicit",
			});

			assert.equal(result.value, expected);
		}
	});

	it("清理英文联系时间两侧空格并忽略大小写", () => {
		const result = normalizeMemoryCandidate({
			type: "preference",
			key: "contactTime",
			value: " Evening ",
			confidence: 1,
			source: "user_explicit",
		});

		assert.equal(result.value, "evening");
	});

	it("无法识别的联系时间保持原值，交给 Policy 拒绝", () => {
		const result = normalizeMemoryCandidate({
			type: "preference",
			key: "contactTime",
			value: "凌晨",
			confidence: 1,
			source: "user_explicit",
		});

		assert.equal(result.value, "凌晨");
	});

	it("不会修改与联系时间无关的 Candidate", () => {
		const candidate: MemoryCandidate = {
			type: "interest",
			key: "topic",
			value: "PLC",
			confidence: 1,
			source: "user_explicit",
		};

		const result = normalizeMemoryCandidate(candidate);

		assert.strictEqual(result, candidate);
	});
});

describe("isContactTime", () => {
	it("只接受系统内部的三个标准值", () => {
		assert.equal(isContactTime("morning"), true);
		assert.equal(isContactTime("afternoon"), true);
		assert.equal(isContactTime("evening"), true);
		assert.equal(isContactTime("晚上"), false);
		assert.equal(isContactTime("night"), false);
	});
});
