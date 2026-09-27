import { documents, type Document } from "./documents";
import { embedding } from "./embedding";

export type IndexedDocument = {
	document: Document;
	vector: number[];
};

/** 为每篇资料生成向量，建立当前进程中的文档索引。 */
export async function indexDocuments(): Promise<IndexedDocument[]> {
	return Promise.all(
		documents.map(async (document) => ({
			document,
			vector: await embedding(document.content),
		})),
	);
}

let cachedIndex: Promise<IndexedDocument[]> | null = null;

/** 在当前进程中按需建索引，并复用已经生成的文档向量。 */
export function getDocumentIndex(): Promise<IndexedDocument[]> {
	if (!cachedIndex) {
		cachedIndex = indexDocuments().catch(error => {
			cachedIndex = null;
			throw error;
		});
	}

	return cachedIndex;
}
