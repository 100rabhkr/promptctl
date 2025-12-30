import Ajv from 'ajv';
import { Assertion } from './types';

export interface AssertionResult {
    pass: boolean;
    reason?: string;
    score: number;
}

const ajv = new Ajv();

export function evaluateAssertion(outputText: string, assertion: Assertion): AssertionResult {
    try {
        switch (assertion.type) {
            case 'equals':
                return {
                    pass: outputText === assertion.value,
                    score: outputText === assertion.value ? 1 : 0,
                    reason: outputText !== assertion.value ? `Expected "${assertion.value}", got "${outputText}"` : undefined
                };

            case 'contains':
                const passContains = outputText.includes(assertion.value);
                return {
                    pass: passContains,
                    score: passContains ? 1 : 0,
                    reason: !passContains ? `Expected to contain "${assertion.value}"` : undefined
                };

            case 'regex':
                if (!assertion.pattern) {
                    return { pass: false, score: 0, reason: 'Regex pattern missing' };
                }
                const regex = new RegExp(assertion.pattern, assertion.flags);
                const passRegex = regex.test(outputText);
                return {
                    pass: passRegex,
                    score: passRegex ? 1 : 0,
                    reason: !passRegex ? `Expected to match regex /${assertion.pattern}/${assertion.flags || ''}` : undefined
                };

            case 'json_schema':
                if (!assertion.schema) {
                    return { pass: false, score: 0, reason: 'JSON Schema missing' };
                }
                let parsedJson;
                try {
                    parsedJson = JSON.parse(outputText);
                } catch (e) {
                    return { pass: false, score: 0, reason: 'Output is not valid JSON' };
                }

                const validate = ajv.compile(assertion.schema);
                const valid = validate(parsedJson);

                return {
                    pass: !!valid,
                    score: valid ? 1 : 0,
                    reason: !valid ? `JSON Schema validation failed: ${ajv.errorsText(validate.errors)}` : undefined
                };

            case 'custom':
                return { pass: false, score: 0, reason: 'Custom assertions not yet implemented' };

            default:
                return { pass: false, score: 0, reason: `Unknown assertion type: ${assertion.type}` };
        }
    } catch (error: any) {
        return {
            pass: false,
            score: 0,
            reason: `Assertion error: ${error.message}`
        };
    }
}
