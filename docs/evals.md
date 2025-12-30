# Evaluations

Evaluations are the core of promptctl. They allow you to systematically test your prompts against dataset.

## Test File Format

Arguments are passed as a JSON array of Test Case objects.

```typescript
interface TestCase {
  id: string;
  input: string | Record<string, any>; // Replaces {{key}} in prompt
  assert?: Assertion[];
}
```

## Assertions

We support the following assertions:

### `equals`
Exact string match.
```json
{ "type": "equals", "value": "exact output" }
```

### `contains`
Substring match.
```json
{ "type": "contains", "value": "partial match" }
```

### `regex`
Regular expression match.
```json
{ "type": "regex", "pattern": "^[0-9]+$", "flags": "i" }
```

### `json_schema`
Validates that output is valid JSON and matches a schema (via AJV).
```json
{ 
  "type": "json_schema", 
  "schema": {
    "type": "object",
    "required": ["rating"],
    "properties": { "rating": { "type": "number" } }
  }
}
```

## A/B Testing

You can compare two prompts using the same test set.

```bash
promptctl ab prompts/v1.md prompts/v2.md --tests tests/data.json
```

This runs both prompts and uses bootstrap resampling to calculate a 95% Confidence Interval for the score difference.
