import type { LeadResult } from "../schemas/lead.schema";

export async function handleLead(result: LeadResult) {
	if (result.confidence < 0.6) {
		console.log("⚠️ AI 判断不确定，转人工审核");

		return;
	}

	switch (result.nextAction) {
		case "sales_follow_up":
			console.log("🔥 创建销售跟进任务");

			break;

		case "later_follow_up":
			console.log("⏰ 加入后续跟进队列");

			break;

		case "ignore":
			console.log("⛔ 暂不跟进");

			break;
	}
}
