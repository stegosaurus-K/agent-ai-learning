import { runAgent } from "./agents/lead-agent";
import { loadMemory, saveMemory } from "./memory/memory.store";

async function main() {
	const userId = "customer_001";
	const existingMemory = await loadMemory(userId);

	if (!existingMemory) {
		const timestamp = new Date().toISOString();

		await saveMemory({
			userId,
			name: "张三",
			interests: ["PLC"],
			preferences: {
				contactTime: {
					value: "afternoon",
					confidence: 1,
					source: "system",
					createdAt: timestamp,
					updatedAt: timestamp,
				},
			},
			objections: ["担心就业"],
		});
	}

	await runAgent(
		userId,
		"我最近也对工业机器人课程感兴趣，以后改成晚上联系我，我还担心自己没有编程基础。"
	);
	// await runAgent("customer_001", "客户 customer_001 想看看课程资料");

	console.log("\n========== 第二次对话 ==========\n");

	await runAgent(userId, "请按照我的联系偏好，明天联系我。");
}

main().catch(error => {
	console.error("执行失败：", error);
	process.exitCode = 1;
});
