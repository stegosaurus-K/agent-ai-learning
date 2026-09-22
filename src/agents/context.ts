import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

/**
 * 创建一次 Agent 运行所需的初始对话上下文。
 */
export function createAgentContext(
	userMessage: string,
): ChatCompletionMessageParam[] {
	return [
		{
			role: "user",
			content: userMessage,
		},
	];
}
