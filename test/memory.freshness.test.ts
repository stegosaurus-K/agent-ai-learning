import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isMemoryFresh } from "../src/memory/memory.freshness";

const now = new Date("2026-09-27T12:00:00.000Z");

describe("isMemoryFresh", () => {
	it("生命周期内的 Memory 仍然有效", () => {
		assert.equal(
			isMemoryFresh("2026-09-01T12:00:00.000Z", 30, now),
			true,
		);
	});

	it("恰好达到最大生命周期时视为过期", () => {
		assert.equal(
			isMemoryFresh("2026-08-28T12:00:00.000Z", 30, now),
			false,
		);
	});

	it("超过最大生命周期的 Memory 已过期", () => {
		assert.equal(
			isMemoryFresh("2026-08-01T12:00:00.000Z", 30, now),
			false,
		);
	});

	it("拒绝来自未来的更新时间", () => {
		assert.equal(
			isMemoryFresh("2026-09-28T12:00:00.000Z", 30, now),
			false,
		);
	});

	it("拒绝非法时间和非法生命周期", () => {
		assert.equal(isMemoryFresh("昨天", 30, now), false);
		assert.equal(isMemoryFresh("2026-09-01T12:00:00.000Z", 0, now), false);
		assert.equal(
			isMemoryFresh("2026-09-01T12:00:00.000Z", Number.NaN, now),
			false,
		);
	});
});
