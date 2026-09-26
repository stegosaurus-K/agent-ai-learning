import { isMemoryFresh } from "./memory.freshness";
import type { ContactTime, UserMemory } from "./memory.types";

const CONTACT_TIME_MAX_AGE_DAYS = 180;

const contactKeywords = [
	"联系",
	"回访",
	"提醒",
	"时间",
	"方便",
	"上午",
	"下午",
	"晚上",
];

const interestKeywords = [
	"课程",
	"学习",
	"资料",
	"方向",
	"兴趣",
	"关注",
	"plc",
	"机器人",
	"电工",
];

const objectionKeywords = [
	"担心",
	"顾虑",
	"就业",
	"基础",
	"学不会",
	"难度",
];

export type SelectedMemory = {
	userId: string;
	name?: string;
	interests?: string[];
	preferences?: {
		contactTime?: ContactTime;
	};
	objections?: string[];
};

function includesAnyKeyword(task: string, keywords: string[]): boolean {
	const normalizedTask = task.toLowerCase();
	return keywords.some(keyword => normalizedTask.includes(keyword));
}

/** 根据当前任务选择相关且仍然有效的长期记忆。 */
export function selectMemory(
	memory: UserMemory,
	task: string,
	now: Date = new Date(),
): SelectedMemory {
	const selected: SelectedMemory = {
		userId: memory.userId,
	};

	if (memory.name) {
		selected.name = memory.name;
	}

	if (
		memory.interests?.length &&
		includesAnyKeyword(task, interestKeywords)
	) {
		selected.interests = memory.interests;
	}

	const contactTime = memory.preferences?.contactTime;
	if (
		contactTime &&
		includesAnyKeyword(task, contactKeywords) &&
		isMemoryFresh(
			contactTime.updatedAt,
			CONTACT_TIME_MAX_AGE_DAYS,
			now,
		)
	) {
		selected.preferences = {
			contactTime: contactTime.value,
		};
	}

	if (
		memory.objections?.length &&
		includesAnyKeyword(task, objectionKeywords)
	) {
		selected.objections = memory.objections;
	}

	return selected;
}
