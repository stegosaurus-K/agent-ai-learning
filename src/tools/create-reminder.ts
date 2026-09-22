// tools/create-reminder.ts

export async function createReminder({
	customerId,
	time,
}: {
	customerId: string;
	time: string;
}) {
	console.log(`⏰ 创建提醒：${customerId} - ${time}`);

	return {
		success: true,
		reminderId: "reminder_001",
	};
}
