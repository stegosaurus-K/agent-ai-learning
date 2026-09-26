import type { ContactTime, MemoryCandidate } from "./memory.types";

const contactTimeAliases: Record<string, ContactTime> = {
	上午: "morning",
	早上: "morning",
	morning: "morning",
	下午: "afternoon",
	afternoon: "afternoon",
	晚上: "evening",
	夜间: "evening",
	evening: "evening",
};

export function isContactTime(value: string): value is ContactTime {
	return value === "morning" || value === "afternoon" || value === "evening";
}

/**
 * 将模型可能返回的同义值转换为系统内部的统一格式。
 */
export function normalizeMemoryCandidate(
	candidate: MemoryCandidate,
): MemoryCandidate {
	if (candidate.type !== "preference" || candidate.key !== "contactTime") {
		return candidate;
	}

	const normalizedValue = contactTimeAliases[candidate.value.trim().toLowerCase()];

	if (!normalizedValue) {
		return candidate;
	}

	return {
		...candidate,
		value: normalizedValue,
	};
}
