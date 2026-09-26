import { extractMemory } from "./memory.extractor";

const testMessages = [
	"我叫张三，对 PLC 比较感兴趣，以后尽量下午联系我，我比较担心学完找不到工作。",
	"我今天中午吃了一碗牛肉面。",
];

async function main(): Promise<void> {
	for (const message of testMessages) {
		console.log("\n用户消息：", message);

		const candidates = await extractMemory(message);

		console.log("Memory Candidates:", candidates);
	}
}

main().catch(error => {
	console.error("Memory Extraction Demo 执行失败：", error);
	process.exitCode = 1;
});
