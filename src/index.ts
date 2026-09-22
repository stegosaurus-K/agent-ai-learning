import { runAgent } from "./agents/lead-agent";

async function main() {
	await runAgent("帮我查询张三有没有咨询记录，如果咨询过，明天下午联系他");
	// await runAgent("客户 customer_001 想看看课程资料");
}

main().catch(error => {
	console.error("执行失败：", error);
	process.exitCode = 1;
});
