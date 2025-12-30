import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { Prompt } from './types';

export async function loadPrompt(filePath: string): Promise<Prompt> {
    const absolutePath = path.resolve(filePath);
    const fileContent = await fs.readFile(absolutePath, 'utf-8');
    const extension = path.extname(filePath).toLowerCase();

    // Initialize default prompt object
    const prompt: Prompt = {
        body: '',
        filePath: absolutePath,
    };

    if (extension === '.md' || extension === '.markdown') {
        // Parse frontmatter
        const parsed = matter(fileContent);
        prompt.body = parsed.content.trim();

        // Merge data from frontmatter
        if (parsed.data) {
            if (typeof parsed.data.name === 'string') prompt.name = parsed.data.name;
            if (typeof parsed.data.model === 'string') prompt.model = parsed.data.model;
            if (typeof parsed.data.temperature === 'number') prompt.temperature = parsed.data.temperature;
            if (typeof parsed.data.max_output_tokens === 'number') prompt.maxOutputTokens = parsed.data.max_output_tokens;

            // Copy other metadata
            Object.assign(prompt, parsed.data);
        }
    } else {
        // Raw text file
        prompt.body = fileContent.trim();
    }

    return prompt;
}
