import OpenAI from "openai";

function createEmbeddingClient(): OpenAI {
	const apiKey = process.env.AI_EMBEDDING_API_KEY?.trim();
	const baseURL = process.env.AI_EMBEDDING_BASE_URL?.trim();

	if (!apiKey) {
		throw new Error("缺少 AI_EMBEDDING_API_KEY，请在 .env 中配置向量模型的 API Key。");
	}

	if (!baseURL) {
		throw new Error("缺少 AI_EMBEDDING_BASE_URL，请在 .env 中配置向量模型的 Base URL。");
	}

	return new OpenAI({ apiKey, baseURL });
}

/** 将文字转换为语义向量。 */
export async function embedding(text: string): Promise<number[]> {
	const model = process.env.AI_EMBEDDING_MODEL?.trim();

	if (!model) {
		throw new Error("缺少 AI_EMBEDDING_MODEL，请在 .env 中配置 Embedding 模型。");
	}

	const response = await createEmbeddingClient().embeddings.create({
		model,
		input: text,
		encoding_format: "float",
	});

	const vector = response.data[0]?.embedding;

	if (!vector?.length) {
		throw new Error("Embedding API 没有返回向量。");
	}

	return vector;
}
