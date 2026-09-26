import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import type { SelectedMemory } from "../memory/memory.selector";

/**
 * 创建一次 Agent 运行所需的初始对话上下文。
 */
export function createAgentContext(
	userMessage: string,
	memory: SelectedMemory | null,
): ChatCompletionMessageParam[] {
	const messages: ChatCompletionMessageParam[] = [];

	if (memory) {
		messages.push({
			role: "system",
			content: `你是一名销售 Agent。
已知客户长期信息：
${JSON.stringify(memory, null, 2)}
只使用与当前任务相关的记忆。`,
		});
	}

	messages.push({
		role: "user",
		content: userMessage,
	});

	return messages;
}
