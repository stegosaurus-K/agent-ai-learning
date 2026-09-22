import OpenAI from "openai";
import type {
	ChatCompletionMessage,
	ChatCompletionMessageParam,
	ChatCompletionTool,
} from "openai/resources/chat/completions";

const apiKey = process.env.OPENAI_API_KEY?.trim();

if (!apiKey) {
	throw new Error(
		"缺少 OPENAI_API_KEY。请配置 .env，并使用 --env-file=.env 启动程序。",
	);
}

const client = new OpenAI({
	apiKey,
	baseURL: process.env.AI_BASE_URL?.trim() || undefined,
});

const model = process.env.AI_MODEL?.trim() || "deepseek-flash";

/**
 * 调用 LLM，并将模型返回的 JSON 文本转换为待校验的数据。
 *
 * 这里只保证返回值是合法 JSON；具体业务结构由上层 Zod Schema 校验。
 */
export async function llmClient(prompt: string): Promise<unknown> {
	const response = await client.chat.completions.create({
		model,
		messages: [
			{
				role: "user",
				content: prompt,
			},
		],
		response_format: {
			type: "json_object",
		},
	});

	const outputText = response.choices[0]?.message.content?.trim();

	if (!outputText) {
		throw new Error("LLM 没有返回可解析的文本内容。");
	}

	try {
		return JSON.parse(outputText) as unknown;
	} catch (error) {
		throw new Error(`LLM 返回的内容不是合法 JSON：${outputText}`, {
			cause: error,
		});
	}
}

/**
 * 将可用工具提供给 LLM，让模型判断是否需要调用工具。
 *
 * 这里只返回模型消息以及其中可能存在的 tool_calls，
 * 不负责解析参数或执行真正的工具函数。
 */
export async function callLLMWithTools(
	messages: ChatCompletionMessageParam[],
	tools: ChatCompletionTool[],
): Promise<ChatCompletionMessage> {
	const response = await client.chat.completions.create({
		model,
		messages,
		tools,
		tool_choice: "auto",
	});

	const message = response.choices[0]?.message;

	if (!message) {
		throw new Error("LLM 没有返回消息。");
	}

	return message;
}
