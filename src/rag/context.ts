import type { RetrievedDocument } from "./retriever";

/** 将检索结果整理为可提供给模型的资料文本。 */
export function buildRagContext(results: RetrievedDocument[]): string {
	if (results.length === 0) {
		return "未检索到相关资料。";
	}

	return results
		.map(
			({ document }, index) =>
				`[资料 ${index + 1}]
标题：${document.title}
年份：${document.year}
内容：${document.content}`,
		)
		.join("\n\n");
}
