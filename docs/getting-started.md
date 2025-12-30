# Getting Started

## 1. Setup

Promptctl is a workspace-based tool. You typically set up a repository where you store your prompts and tests.

```bash
promptctl init
```

This creates:
- `prompts/`: Store your `.md` prompt files here.
- `tests/`: Store `.json` test files here.
- `.promptctl/`: Local config and logs.

## 2. Writing a Prompt

Create a file `prompts/sentiment.md`:

```markdown
---
model: gemini-1.5-flash
temperature: 0
---
Classify the sentiment of the text as POSITIVE or NEGATIVE.
Text: {{input}}
Classification:
```

## 3. Writing Tests

Create `tests/sentiment.json`:

```json
[
  {
    "id": "1",
    "input": "I love this!",
    "assert": [{ "type": "contains", "value": "POSITIVE" }]
  },
  {
    "id": "2",
    "input": "I hate this.",
    "assert": [{ "type": "contains", "value": "NEGATIVE" }]
  }
]
```

## 4. Run Eval

```bash
promptctl eval prompts/sentiment.md --tests tests/sentiment.json
```
