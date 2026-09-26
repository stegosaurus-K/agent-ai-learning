import type {
	MemoryCandidate,
	MemorySource,
	MemoryValue,
} from "./memory.types";

const sourceAuthority: Record<MemorySource, number> = {
	system: 0,
	user_inferred: 1,
	tool_result: 2,
	user_explicit: 3,
};

/**
 * 解决单值 Memory 的冲突。
 * 权威性更低的新 Candidate 不能覆盖权威性更高的旧 Memory；
 * 来源权威性相同时，允许较新的 Candidate 覆盖旧值。
 */
export function resolveConflict<T extends string>(
	oldMemory: MemoryValue<T>,
	candidate: Omit<MemoryCandidate, "value"> & { value: T },
	now: Date = new Date(),
): MemoryValue<T> {
	if (sourceAuthority[candidate.source] < sourceAuthority[oldMemory.source]) {
		return oldMemory;
	}

	return {
		value: candidate.value,
		confidence: candidate.confidence,
		source: candidate.source,
		createdAt: oldMemory.createdAt,
		updatedAt: now.toISOString(),
	};
}
