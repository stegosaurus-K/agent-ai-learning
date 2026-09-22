import { runAgentLoop } from "./agent-loop";
import { createAgentContext } from "./context";

/**
 * 创建销售线索 Agent 的 Context，并启动 Agent Loop。
 */
export async function runAgent(userMessage: string): Promise<void> {
	const messages = createAgentContext(userMessage);
	await runAgentLoop(messages);
}
