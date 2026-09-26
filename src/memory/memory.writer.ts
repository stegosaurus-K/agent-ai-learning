import { extractMemory } from "./memory.extractor";
import { updateMemory } from "./memory.manager";
import type { UserMemory } from "./memory.types";

/**
 * 从一条用户消息中提取候选记忆，并更新该用户的长期记忆。
 */
export async function rememberUserMessage(
	userId: string,
	message: string,
): Promise<UserMemory | null> {
	const candidates = await extractMemory(message);

	return updateMemory(userId, candidates);
}
