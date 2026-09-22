import { z } from "zod";

/** search_customer 的参数契约 */
export const SearchCustomerArgumentsSchema = z.strictObject({
	name: z.string().trim().min(1, "客户姓名不能为空"),
});

/** create_reminder 的参数契约 */
export const CreateReminderArgumentsSchema = z.strictObject({
	customerId: z.string().trim().min(1, "客户 ID 不能为空"),
	time: z.string().trim().min(1, "提醒时间不能为空"),
});

/** send_course_info 的参数契约 */
export const SendCourseInfoArgumentsSchema = z.strictObject({
	customerId: z.string().trim().min(1, "客户 ID 不能为空"),
});

export type SearchCustomerArguments = z.infer<
	typeof SearchCustomerArgumentsSchema
>;

export type CreateReminderArguments = z.infer<
	typeof CreateReminderArgumentsSchema
>;

export type SendCourseInfoArguments = z.infer<
	typeof SendCourseInfoArgumentsSchema
>;
