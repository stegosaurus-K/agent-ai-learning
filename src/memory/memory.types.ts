export type ContactTime = "morning" | "afternoon" | "evening";

export type MemorySource =
	| "user_explicit"
	| "user_inferred"
	| "tool_result"
	| "system";

/**
 * 带来源和时间信息的可信记忆值。
 *
 * T 表示真正保存的数据类型，例如 ContactTime 或 string。
 */
export type MemoryValue<T> = {
	value: T;
	confidence: number;
	source: MemorySource;
	createdAt: string;
	updatedAt: string;
};

/**
 * 用户长期记忆。
 *
 * 这里只保存未来任务仍可能有价值的信息，
 * 不保存当前 Agent Loop 的临时状态。
 */
export type UserMemory = {
	userId: string;
	name?: string;
	interests?: string[];
	preferences?: {
		contactTime?: MemoryValue<ContactTime>;
	};
	objections?: string[];
};

/**
 * 从用户消息中提取出的候选记忆。
 *
 * Candidate 通过校验和写入策略后，才会成为 UserMemory。
 */
export type MemoryCandidate = {
	type: "identity" | "preference" | "interest" | "objection";
	key: string;
	value: string;
	confidence: number;
	source: MemorySource;
};

/** 模型抽取出的原始 Candidate，来源由应用程序补充。 */
export type ExtractedMemoryCandidate = Omit<MemoryCandidate, "source">;
