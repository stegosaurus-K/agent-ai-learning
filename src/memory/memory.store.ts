import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { ZodError } from "zod";
import {
	MemoryDatabaseSchema,
	UserMemorySchema,
} from "../schemas/memory.schema";
import type { UserMemory } from "./memory.types";

/**
 * JSON 文件版 Memory Store。
 * 数据保存在项目根目录的 data/memory.json 中。
 */
const memoryFilePath = path.resolve(process.cwd(), "data", "memory.json");

type MemoryDatabase = Record<string, UserMemory>;

async function readMemoryDatabase(): Promise<MemoryDatabase> {
	try {
		const content = await readFile(memoryFilePath, "utf8");
		return MemoryDatabaseSchema.parse(JSON.parse(content));
	} catch (error) {
		if (
			error instanceof Error &&
			"code" in error &&
			error.code === "ENOENT"
		) {
			return {};
		}

		if (error instanceof SyntaxError) {
			throw new Error(`Memory 文件不是合法 JSON：${memoryFilePath}`, {
				cause: error,
			});
		}

		if (error instanceof ZodError) {
			const details = error.issues
				.map(issue => `${issue.path.join(".")}: ${issue.message}`)
				.join("; ");

			throw new Error(
				`Memory 文件结构不符合 Schema：${memoryFilePath}\n${details}`,
				{ cause: error },
			);
		}

		throw error;
	}
}

export async function loadMemory(userId: string): Promise<UserMemory | null> {
	const database = await readMemoryDatabase();
	return database[userId] ?? null;
}

export async function saveMemory(memory: UserMemory): Promise<void> {
	const database = await readMemoryDatabase();
	const validatedMemory = UserMemorySchema.parse(memory);
	database[validatedMemory.userId] = validatedMemory;

	const memoryDirectory = path.dirname(memoryFilePath);
	const temporaryFilePath = path.join(
		memoryDirectory,
		`.memory-${randomUUID()}.tmp`,
	);

	await mkdir(memoryDirectory, { recursive: true });

	try {
		await writeFile(
			temporaryFilePath,
			`${JSON.stringify(database, null, 2)}\n`,
			"utf8",
		);
		await rename(temporaryFilePath, memoryFilePath);
	} catch (error) {
		await unlink(temporaryFilePath).catch(() => undefined);
		throw error;
	}
}
