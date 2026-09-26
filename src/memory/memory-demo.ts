import { loadMemory, saveMemory } from "./memory.store";

async function main(): Promise<void> {
	const timestamp = new Date().toISOString();

	await saveMemory({
		userId: "customer_001",
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

	const memory = await loadMemory("customer_001");

	console.log("读取到的 Memory:", memory);
}

main().catch(error => {
	console.error("Memory Demo 执行失败：", error);
	process.exitCode = 1;
});
