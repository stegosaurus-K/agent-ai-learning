import { isContactTime } from "./memory.normalizer";
import { shouldSaveMemory } from "./memory.policy";
import { resolveConflict } from "./memory.conflict";
import type { MemoryCandidate, UserMemory } from "./memory.types";

function appendUnique(values: string[] | undefined, value: string): string[] {
	const currentValues = values ?? [];

	if (currentValues.includes(value)) {
		return currentValues;
	}

	return [...currentValues, value];
}

/**
 * 将一条通过写入规则的 Candidate 合并进用户长期记忆。
 */
export function mergeMemory(
	oldMemory: UserMemory,
	candidate: MemoryCandidate,
	now: Date = new Date(),
): UserMemory {
	if (!shouldSaveMemory(candidate)) {
		return oldMemory;
	}

	switch (candidate.type) {
		case "identity":
			if (oldMemory.name === candidate.value) {
				return oldMemory;
			}

			return {
				...oldMemory,
				name: candidate.value,
			};
		case "preference":
			if (!isContactTime(candidate.value)) {
				return oldMemory;
			}

			const oldContactTime = oldMemory.preferences?.contactTime;

			if (oldContactTime?.value === candidate.value) {
				return oldMemory;
			}

			const timestamp = now.toISOString();
			const contactTime = oldContactTime
				? resolveConflict(
						oldContactTime,
						{ ...candidate, value: candidate.value },
						now,
					)
				: {
						value: candidate.value,
						confidence: candidate.confidence,
						source: candidate.source,
						createdAt: timestamp,
						updatedAt: timestamp,
					};

			if (contactTime === oldContactTime) {
				return oldMemory;
			}

			return {
				...oldMemory,
				preferences: {
					...oldMemory.preferences,
					contactTime,
				},
			};
		case "interest": {
			const interests = appendUnique(
				oldMemory.interests,
				candidate.value,
			);

			if (interests === oldMemory.interests) {
				return oldMemory;
			}

			return {
				...oldMemory,
				interests,
			};
		}
		case "objection": {
			const objections = appendUnique(
				oldMemory.objections,
				candidate.value,
			);

			if (objections === oldMemory.objections) {
				return oldMemory;
			}

			return {
				...oldMemory,
				objections,
			};
		}
	}
}
