import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import type { SelectedMemory } from "../memory/memory.selector";
import { buildRagContext } from "../rag/context";
import type { RetrievedDocument } from "../rag/retriever";

/**
 * 创建一次 Agent 运行所需的初始对话上下文。
 */
export function createAgentContext(
	userMessage: string,
	memory: SelectedMemory | null,
	knowledge: RetrievedDocument[] | null = null,
	toolCustomerId: string | null = null,
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

	if (knowledge !== null) {
		messages.push({
			role: "system",
			content: `企业知识库资料：
${buildRagContext(knowledge)}
回答业务知识问题时只能依据这些资料；如果资料不足，请明确说明，不要编造。`,
		});
	}

	if (toolCustomerId) {
		messages.push({
			role: "system",
			content: `当前会话的客户 ID 由程序提供：${toolCustomerId}。调用需要 customerId 的工具时使用这个 ID，不必再询问客户姓名。`,
		});
	}

	messages.push({
		role: "user",
		content: userMessage,
	});

	return messages;
}
