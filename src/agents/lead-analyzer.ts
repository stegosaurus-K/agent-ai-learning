import { llmClient } from "../llm/client";
import { LeadResult, LeadResultSchema } from "../schemas/lead.schema";

export async function analyzeLead(message: string): Promise<LeadResult> {
	const prompt = `
你是一名销售线索分析助手。

请分析客户的购买意向，并只返回一个 JSON 对象，不要返回 Markdown 或额外说明。

JSON 字段要求：
- intent: "high"、"medium" 或 "low"
- confidence: 0 到 1 之间的数字
- reason: 判断理由
- nextAction: "sales_follow_up"、"later_follow_up" 或 "ignore"

客户消息：${message}
`;

	const rawResult = await llmClient(prompt);

	const result = LeadResultSchema.parse(rawResult);

	return result;
}
