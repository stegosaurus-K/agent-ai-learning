import { analyzeLead } from "./agents/lead-analyzer";
import { handleLead } from "./services/sales.service";

async function main() {
	const message =
		"最近工作比较忙，过两个月再看看吧。课程多少钱？什么时候可以报名？";

	const result = await analyzeLead(message);

	console.log("线索分析结果：", result);
	await handleLead(result);
}

main().catch(error => {
	console.error("执行失败：", error);
	process.exitCode = 1;
});
