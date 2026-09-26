const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * 判断一条 Memory 是否仍在允许的生命周期内。
 *
 * 恰好到达 maxAgeDays 时视为过期；未来时间和非法时间也视为无效。
 */
export function isMemoryFresh(
	updatedAt: string,
	maxAgeDays: number,
	now: Date = new Date(),
): boolean {
	if (!Number.isFinite(maxAgeDays) || maxAgeDays <= 0) {
		return false;
	}

	const updatedAtTime = new Date(updatedAt).getTime();
	const age = now.getTime() - updatedAtTime;

	if (!Number.isFinite(updatedAtTime) || age < 0) {
		return false;
	}

	return age < maxAgeDays * MILLISECONDS_PER_DAY;
}
