import { llmClient } from "../llm/client";
import { RouteDecisionSchema, type RouteDecision } from "../schemas/route.schema";

/** 判断当前消息需要哪些 Agent 能力，不在这里执行检索或工具。 */
export async function routeRequest(message: string): Promise<RouteDecision> {
	const raw = await llmClient(`你是销售 Agent 的请求路由器。根据用户消息判断当前任务需要哪些能力。

请只返回 JSON 对象，包含以下三个布尔字段：
- useMemory：消息涉及用户长期信息，或需要读取已有的姓名、兴趣、联系偏好时为 true。
- useRAG：需要查询企业知识库中的课程、制度或服务信息时为 true。
- allowTools：需要执行外部动作（如创建提醒、发送资料或查询客户记录）时为 true。

三个字段可以同时为 true；如果都不需要，全部为 false。不要执行任何动作，也不要回答用户问题。

用户消息：${message}`);

	return RouteDecisionSchema.parse(raw);
}
