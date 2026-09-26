import { isContactTime } from "./memory.normalizer";
import type { MemoryCandidate } from "./memory.types";

const MIN_MEMORY_CONFIDENCE = 0.8;

/**
 * 判断一条候选记忆是否满足当前的写入规则。
 */
export function shouldSaveMemory(candidate: MemoryCandidate): boolean {
	if (candidate.confidence < MIN_MEMORY_CONFIDENCE) {
		return false;
	}

	switch (candidate.type) {
		case "identity":
			return candidate.key === "name";
		case "preference":
			return (
				candidate.key === "contactTime" &&
				isContactTime(candidate.value)
			);
		case "interest":
			return candidate.key === "topic";
		case "objection":
			return candidate.key === "concern";
	}
}
