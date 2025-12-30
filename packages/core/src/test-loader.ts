import fs from 'fs/promises';
import path from 'path';
import { TestCase } from './types';

export async function loadTests(filePath: string): Promise<TestCase[]> {
    const absolutePath = path.resolve(filePath);
    const fileContent = await fs.readFile(absolutePath, 'utf-8');

    try {
        const parsed = JSON.parse(fileContent);
        if (!Array.isArray(parsed)) {
            throw new Error(`Test file ${filePath} must contain a JSON array`);
        }

        // Basic validation (can be enhanced with zod later)
        return parsed.map((item: any) => {
            if (!item.id) throw new Error('Test case missing "id"');
            if (item.input === undefined) throw new Error('Test case missing "input"');

            return item as TestCase;
        });
    } catch (error: any) {
        throw new Error(`Failed to parse test file ${filePath}: ${error.message}`);
    }
}
