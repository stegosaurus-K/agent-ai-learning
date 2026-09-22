import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { ZodError } from "zod";

import { callLLMWithTools } from "../llm/client";
import {
	toolArgumentSchemas,
	toolHandlers,
	tools,
	type ToolName,
} from "../tools/registry";

const MAX_STEPS = 5;

function isToolName(name: string): name is ToolName {
	return Object.hasOwn(toolHandlers, name);
}

async function executeTool(
	toolName: ToolName,
	toolArguments: unknown,
): Promise<unknown> {
	switch (toolName) {
		case "search_customer":
			return toolHandlers.search_customer(
				toolArgumentSchemas.search_customer.parse(toolArguments),
			);
		case "create_reminder":
			return toolHandlers.create_reminder(
				toolArgumentSchemas.create_reminder.parse(toolArguments),
			);
		case "send_course_info":
			return toolHandlers.send_course_info(
				toolArgumentSchemas.send_course_info.parse(toolArguments),
			);
	}
}

/**
 * 持续让模型判断下一步，并执行模型选择的工具。
 */
export async function runAgentLoop(
	messages: ChatCompletionMessageParam[],
): Promise<void> {
	for (let step = 1; step <= MAX_STEPS; step += 1) {
		console.log(`\n--- Agent 第 ${step} 轮 ---`);

		const message = await callLLMWithTools(messages, tools);
		const toolCall = message.tool_calls?.[0];

		if (!toolCall) {
			console.log("AI:", message.content ?? "模型没有返回文本内容。");
			return;
		}

		if (toolCall.type !== "function") {
			throw new Error(`暂不支持的工具类型：${toolCall.type}`);
		}

		console.log("模型选择 Tool:", toolCall.function.name);
		console.log("参数:", toolCall.function.arguments);

		const toolName = toolCall.function.name;

		if (!isToolName(toolName)) {
			throw new Error(`未知的工具：${toolName}`);
		}

		let toolArguments: unknown;

		try {
			toolArguments = JSON.parse(toolCall.function.arguments);
		} catch (error) {
			throw new Error(`工具参数不是合法 JSON：${toolCall.function.arguments}`, {
				cause: error,
			});
		}

		let toolResult: unknown;

		try {
			toolResult = await executeTool(toolName, toolArguments);
		} catch (error) {
			if (error instanceof ZodError) {
				throw new Error(`工具 ${toolName} 参数校验失败：${error.message}`, {
					cause: error,
				});
			}

			throw error;
		}

		console.log("Tool Result:", toolResult);

		messages.push(message);
		messages.push({
			role: "tool",
			tool_call_id: toolCall.id,
			content: JSON.stringify(toolResult),
		});

		console.log("当前 Context 消息数:", messages.length);
	}

	throw new Error(`Agent 超过最大执行轮数：${MAX_STEPS}`);
}
