import { client, model } from "../llm/client";
import { buildRagContext } from "./context";
import type { RetrievedDocument } from "./retriever";

/** 只依据检索到的资料回答问题。 */
export async function generateRagAnswer(
	question: string,
	results: RetrievedDocument[],
): Promise<string> {
	if (results.length === 0) {
		return "未检索到相关资料，无法回答该问题。";
	}

	const response = await client.chat.completions.create({
		model,
		messages: [
			{
				role: "system",
				content:
					"只能依据提供的资料回答问题。资料没有说明的内容，应明确说资料不足，不要编造。回答时说明依据的资料标题和年份。",
			},
			{
				role: "user",
				content: `资料：\n${buildRagContext(results)}\n\n问题：${question}`,
			},
		],
	});

	const answer = response.choices[0]?.message.content?.trim();

	if (!answer) {
		throw new Error("LLM 没有返回回答。");
	}

	return answer;
}
