import { loadMemory } from "../memory/memory.store";
import { selectMemory } from "../memory/memory.selector";
import { rememberUserMessage } from "../memory/memory.writer";
import { runAgentLoop } from "./agent-loop";
import { createAgentContext } from "./context";

/**
 * 加载用户 Memory，运行 Agent Loop，并在任务结束后更新长期 Memory。
 */
export async function runAgent(
	userId: string,
	userMessage: string,
): Promise<void> {
	const memory = await loadMemory(userId);

	console.log("已加载 Memory:", memory);

	const selectedMemory = memory
		? selectMemory(memory, userMessage)
		: null;

	console.log("注入 Context 的 Memory:", selectedMemory);

	const messages = createAgentContext(userMessage, selectedMemory);
	await runAgentLoop(messages);

	const updatedMemory = await rememberUserMessage(userId, userMessage);

	console.log("更新后的 Memory:", updatedMemory);
}
