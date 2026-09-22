// tools/search-customer.ts

export async function searchCustomer({ name }: { name: string }) {
	console.log(`🔍 查询客户：${name}`);

	// 暂时 Mock CRM 数据
	return {
		id: "customer_001",
		name,
		consulted: true,
		lastConsultation: "2026-08-10",
	};
}
