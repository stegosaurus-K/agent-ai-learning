import { loadMemory } from "./memory.store";
import { rememberUserMessage } from "./memory.writer";

const userId = "customer_003";

const testMessages = [
	"我叫王五，对电工课程比较感兴趣，以后尽量晚上联系我，我比较担心没有基础学不会。",
	"我今天中午吃了一碗牛肉面。",
];

async function main(): Promise<void> {
	for (const message of testMessages) {
		console.log("\n用户消息：", message);

		const memory = await rememberUserMessage(userId, message);

		console.log("更新后的 Memory:", memory);
	}

	console.log("\nStore 中的最终 Memory:", await loadMemory(userId));
}

main().catch(error => {
	console.error("Memory Writer Demo 执行失败：", error);
	process.exitCode = 1;
});
