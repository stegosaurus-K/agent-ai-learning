import { llmClient } from "../llm/client";
import { MemoryExtractionResultSchema } from "../schemas/memory.schema";
import { normalizeMemoryCandidate } from "./memory.normalizer";
import type { MemoryCandidate } from "./memory.types";

/**
 * 从用户消息中提取可能值得长期保存的记忆。
 *
 * 这里只生成并校验 Candidate，不负责写入 Memory Store。
 */
export async function extractMemory(
	message: string,
): Promise<MemoryCandidate[]> {
	const output = await llmClient(`
你是一个用户长期记忆提取器。

请从用户消息中提取未来任务仍可能有价值、并且由用户明确表达的信息。

只允许以下四种类型：
- identity：身份信息，例如姓名；姓名使用 key "name"
- preference：长期偏好，例如联系时间；联系时间使用 key "contactTime"
- interest：长期兴趣，例如关注的课程或技术方向；使用 key "topic"
- objection：长期顾虑，例如担心就业；使用 key "concern"

不要提取：
- 只对当前任务有用的临时信息
- Tool Result 或 Agent 当前执行状态
- 用户没有明确表达、只能推测的信息
- 日常闲聊，例如刚吃了什么

请只返回下面格式的 JSON 对象，不要添加解释：
{
  "candidates": [
    {
      "type": "identity | preference | interest | objection",
      "key": "字段名称",
      "value": "字段值",
      "confidence": 0.0
    }
  ]
}

如果没有值得长期保存的信息，返回：
{
  "candidates": []
}

信息来源由程序根据输入通道确定，不要返回 source 字段。

用户消息：
${JSON.stringify(message)}
`);

	const result = MemoryExtractionResultSchema.parse(output);

	return result.candidates.map(candidate =>
		normalizeMemoryCandidate({
			...candidate,
			source: "user_explicit",
		}),
	);
}
