import { mergeMemory } from "./memory.merger";
import { loadMemory, saveMemory } from "./memory.store";
import type { MemoryCandidate, UserMemory } from "./memory.types";

type MemoryStoreDependencies = {
	loadMemory: (userId: string) => Promise<UserMemory | null>;
	saveMemory: (memory: UserMemory) => Promise<void>;
};

const defaultStore: MemoryStoreDependencies = {
	loadMemory,
	saveMemory,
};

/**
 * 将一组候选记忆合并并保存到 Memory Store。
 */
export async function updateMemory(
	userId: string,
	candidates: MemoryCandidate[],
	store: MemoryStoreDependencies = defaultStore,
): Promise<UserMemory | null> {
	const oldMemory = await store.loadMemory(userId);
	let currentMemory: UserMemory = oldMemory ?? { userId };
	let hasChanges = false;

	for (const candidate of candidates) {
		const nextMemory = mergeMemory(currentMemory, candidate);

		if (nextMemory !== currentMemory) {
			hasChanges = true;
		}

		currentMemory = nextMemory;
	}

	if (!hasChanges) {
		return oldMemory;
	}

	await store.saveMemory(currentMemory);

	return currentMemory;
}
