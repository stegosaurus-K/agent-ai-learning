import { loadMemory } from "../memory/memory.store";
import { selectMemory } from "../memory/memory.selector";
import { rememberUserMessage } from "../memory/memory.writer";
import { getDocumentIndex } from "../rag/index";
import { retrieveDocuments, type RetrievedDocument } from "../rag/retriever";
import { runAgentLoop } from "./agent-loop";
import { createAgentContext } from "./context";
import { routeRequest } from "./router";

const EXERCISE_DOCUMENT_YEAR = 2026;

/**
 * 根据路由决策加载相关 Memory，运行 Agent Loop，并按需更新长期 Memory。
 */
export async function runAgent(
	userId: string,
	userMessage: string,
): Promise<void> {
	const route = await routeRequest(userMessage);
	console.log("路由决策:", route);

	const memory = route.useMemory ? await loadMemory(userId) : null;

	if (route.useMemory) {
		console.log("已加载 Memory:", memory);
	}

	const selectedMemory = memory
		? selectMemory(memory, userMessage)
		: null;

	if (route.useMemory) {
		console.log("注入 Context 的 Memory:", selectedMemory);
	}

	let knowledge: RetrievedDocument[] | null = null;

	if (route.useRAG) {
		const index = await getDocumentIndex();
		knowledge = await retrieveDocuments(
			userMessage,
			index,
			2,
			EXERCISE_DOCUMENT_YEAR,
		);
		console.log(
			"检索到的知识:",
			knowledge.map(({ document, score }) => ({
				title: document.title,
				year: document.year,
				score,
			})),
		);
	}

	const messages = createAgentContext(
		userMessage,
		selectedMemory,
		knowledge,
		route.allowTools ? userId : null,
	);
	await runAgentLoop(messages, route.allowTools);

	if (route.useMemory) {
		const updatedMemory = await rememberUserMessage(userId, userMessage);
		console.log("更新后的 Memory:", updatedMemory);
	}
}
