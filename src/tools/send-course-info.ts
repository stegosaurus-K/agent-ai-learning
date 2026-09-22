// tools/send-course-info.ts

export async function sendCourseInfo({ customerId }: { customerId: string }) {
	console.log(`📚 发送课程资料：${customerId}`);

	return {
		success: true,
	};
}
