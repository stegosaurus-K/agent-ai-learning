import type { Document } from "./documents";
import { embedding } from "./embedding";
import type { IndexedDocument } from "./index";
import { cosineSimilarity } from "./similarity";

export type RetrievedDocument = {
	document: Document;
	score: number;
};

/** 可先按年份过滤，再按最低相似度筛选并返回前 K 篇资料。 */
export async function retrieveDocuments(
	query: string,
	index: IndexedDocument[],
	topK = 3,
	year?: number,
	minScore?: number,
): Promise<RetrievedDocument[]> {
	const candidates =
		year === undefined
			? index
			: index.filter(({ document }) => document.year === year);

	if (candidates.length === 0) {
		return [];
	}

	const queryVector = await embedding(query);

	return candidates
		.map(({ document, vector }) => ({
			document,
			score: cosineSimilarity(queryVector, vector),
		}))
		.filter(({ score }) => minScore === undefined || score >= minScore)
		.sort((a, b) => b.score - a.score)
		.slice(0, topK);
}
