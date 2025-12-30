import { describe, it, expect } from 'vitest';
import { evaluateAssertion } from './assertions';
import { Assertion } from './types';

describe('evaluateAssertion', () => {
    it('should pass equals assertion', () => {
        const assertion: Assertion = { type: 'equals', value: 'hello' };
        const result = evaluateAssertion('hello', assertion);
        expect(result.pass).toBe(true);
        expect(result.score).toBe(1);
    });

    it('should fail equals assertion', () => {
        const assertion: Assertion = { type: 'equals', value: 'hello' };
        const result = evaluateAssertion('world', assertion);
        expect(result.pass).toBe(false);
        expect(result.score).toBe(0);
        expect(result.reason).toContain('Expected "hello"');
    });

    it('should pass contains assertion', () => {
        const assertion: Assertion = { type: 'contains', value: 'ell' };
        const result = evaluateAssertion('hello', assertion);
        expect(result.pass).toBe(true);
    });

    it('should fail contains assertion', () => {
        const assertion: Assertion = { type: 'contains', value: 'world' };
        const result = evaluateAssertion('hello', assertion);
        expect(result.pass).toBe(false);
    });

    it('should pass regex assertion', () => {
        const assertion: Assertion = { type: 'regex', pattern: '^h.*o$' };
        const result = evaluateAssertion('hello', assertion);
        expect(result.pass).toBe(true);
    });

    it('should fail regex assertion', () => {
        const assertion: Assertion = { type: 'regex', pattern: '^h.*o$' };
        const result = evaluateAssertion('hola', assertion); // ends with a
        expect(result.pass).toBe(false);
    });

    it('should pass json_schema assertion', () => {
        const output = '{"name": "Alice", "age": 30}';
        const assertion: Assertion = {
            type: 'json_schema',
            schema: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    age: { type: 'number' }
                },
                required: ['name', 'age']
            }
        };
        const result = evaluateAssertion(output, assertion);
        expect(result.pass).toBe(true);
    });

    it('should fail json_schema assertion on invalid json', () => {
        const output = 'not json';
        const assertion: Assertion = { type: 'json_schema', schema: { type: 'object' } };
        const result = evaluateAssertion(output, assertion);
        expect(result.pass).toBe(false);
        expect(result.reason).toContain('not valid JSON');
    });

    it('should fail json_schema assertion on schema mismatch', () => {
        const output = '{"name": "Alice"}';
        const assertion: Assertion = {
            type: 'json_schema',
            schema: {
                type: 'object',
                properties: {
                    age: { type: 'number' }
                },
                required: ['age']
            }
        };
        const result = evaluateAssertion(output, assertion);
        expect(result.pass).toBe(false);
        expect(result.reason).toContain('JSON Schema validation failed');
    });
});
