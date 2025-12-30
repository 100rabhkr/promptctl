export interface Prompt {
    name?: string;
    model?: string;
    temperature?: number;
    maxOutputTokens?: number;
    body: string;
    filePath: string;
    // allow other arbitrary metadata
    [key: string]: any;
}

export type AssertionType = 'equals' | 'contains' | 'regex' | 'json_schema' | 'custom';

export interface Assertion {
    type: AssertionType;
    value?: any; // for equals, contains
    pattern?: string; // for regex
    flags?: string; // for regex
    schema?: object; // for json_schema
    provider?: string; // for llm-based assertions (future)
    threshold?: number;
}

export interface TestCase {
    id: string;
    input: Record<string, any> | string;
    expected?: string;
    assert?: Assertion[];
}
