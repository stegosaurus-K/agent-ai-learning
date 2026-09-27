import assert from "node:assert/strict";
import { it } from "node:test";

it("不涉及长期记忆的消息不会触发 Memory 提取", async () => {
	process.env.OPENAI_API_KEY ??= "test-key";

	const { client } = await import("../src/llm/client.js");
	const { runAgent } = await import("../src/agents/lead-agent.js");
	const originalCreate = client.chat.completions.create;
	let callCount = 0;

	client.chat.completions.create = (async () => {
		callCount += 1;

		return {
			choices: [
				{
					message: {
						content:
							callCount === 1
								? JSON.stringify({
										useMemory: false,
										useRAG: false,
										allowTools: false,
									})
								: "请查看课程协议。",
					},
				},
			],
		};
	}) as unknown as typeof originalCreate;

	try {
		await runAgent("customer_test", "报名后不学了还能退吗？");
		assert.equal(callCount, 2); // Router + 回答；没有第三次 Memory 提取调用
	} finally {
		client.chat.completions.create = originalCreate;
	}
});

it("允许工具时可把当前会话客户 ID 注入 Context", async () => {
	const { createAgentContext } = await import("../src/agents/context.js");
	const messages = createAgentContext(
		"明天下午3点提醒我再看课程。",
		null,
		null,
		"customer_001",
	);

	assert.equal(messages.length, 2);
	assert.equal(messages[0]?.role, "system");
	assert.match(String(messages[0]?.content), /customer_001/);
	assert.equal(messages[1]?.role, "user");
});
