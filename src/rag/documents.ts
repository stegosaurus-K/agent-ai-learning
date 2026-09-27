/** Day 04 练习用的模拟资料，不代表真实课程政策。 */
export type Document = {
	id: string;
	title: string;
	content: string;
	year: number;
};

export const documents: Document[] = [
	{
		id: "refund-2024",
		title: "2024 课程退费制度",
		content: "2024 版课程退费规则：学员申请退费需要按照旧版课程协议执行。",
		year: 2024,
	},
	{
		id: "refund-2026",
		title: "2026 课程退费制度",
		content: "2026 版课程退费规则：符合退费条件的学员可以提交申请，具体金额按照课程协议计算。",
		year: 2026,
	},
	{
		id: "employment",
		title: "就业服务说明",
		content: "完成课程学习后，可获得简历优化、模拟面试和就业岗位推荐服务。",
		year: 2026,
	},
	{
		id: "course",
		title: "课程介绍",
		content: "课程包含电工基础、编程、自动化控制和项目实训。",
		year: 2026,
	},
];
