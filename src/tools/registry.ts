import type { ChatCompletionTool } from "openai/resources/chat/completions";
import type { ZodType } from "zod";

import {
	CreateReminderArgumentsSchema,
	SearchCustomerArgumentsSchema,
	SendCourseInfoArgumentsSchema,
} from "../schemas/tool.schema";
import { createReminder } from "./create-reminder";
import { searchCustomer } from "./search-customer";
import { sendCourseInfo } from "./send-course-info";

/**
 * 提供给 LLM 的工具说明。
 * 模型只能看到工具的名称、用途和参数结构，看不到真正的函数实现。
 */
export const tools: ChatCompletionTool[] = [
	{
		type: "function",
		function: {
			name: "search_customer",
			description: "根据客户姓名查询客户的历史咨询记录",
			parameters: {
				type: "object",
				properties: {
					name: {
						type: "string",
						description: "客户姓名",
					},
				},
				required: ["name"],
				additionalProperties: false,
			},
		},
	},
	{
		type: "function",
		function: {
			name: "create_reminder",
			description: "当客户明确要求稍后联系时，为客户创建回访提醒",
			parameters: {
				type: "object",
				properties: {
					customerId: {
						type: "string",
						description: "客户 ID",
					},
					time: {
						type: "string",
						description: "客户希望再次联系的时间",
					},
				},
				required: ["customerId", "time"],
				additionalProperties: false,
			},
		},
	},
	{
		type: "function",
		function: {
			name: "send_course_info",
			description: "当客户明确要求查看课程资料时，向客户发送课程介绍",
			parameters: {
				type: "object",
				properties: {
					customerId: {
						type: "string",
						description: "客户 ID",
					},
				},
				required: ["customerId"],
				additionalProperties: false,
			},
		},
	},
];

/**
 * Node.js 程序内部使用的工具注册表。
 * 模型返回工具名称后，应用通过这个对象找到真正要执行的函数。
 */
export const toolHandlers = {
	search_customer: searchCustomer,
	create_reminder: createReminder,
	send_course_info: sendCourseInfo,
};

export type ToolName = keyof typeof toolHandlers;

/**
 * 每个工具对应的参数校验规则。
 */
export const toolArgumentSchemas = {
	search_customer: SearchCustomerArgumentsSchema,
	create_reminder: CreateReminderArgumentsSchema,
	send_course_info: SendCourseInfoArgumentsSchema,
} satisfies Record<ToolName, ZodType>;
