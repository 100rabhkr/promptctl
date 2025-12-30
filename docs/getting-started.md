# Getting Started with promptctl

Welcome to **promptctl**! This guide will walk you through the philosophy and practical steps of managing your prompts as code.

---

## Philosophy

At [360labs.dev](https://360labs.dev), we believe that **prompts are software**. They should not live in database columns, sticky notes, or loose playground links. They should be:

1.  **Version Controlled**: Track changes over time.
2.  **Tested**: Verified against deterministic datasets.
3.  **Measurable**: Latency, Cost, and Accuracy should be visible.

**promptctl** is built to enable this workflow.

## 1. Installation

### From Source (Recommended for Developers)

```bash
git clone https://github.com/360labs/promptctl.git
cd promptctl
pnpm install
pnpm run build
```

Verify the installation:

```bash
./packages/cli/bin/run --help
```

For convenience, link it globally:

```bash
cd packages/cli && pnpm link --global
```

## 2. Your First Project

Create a dedicated workspace for your AI artifacts.

```bash
mkdir demo-project
cd demo-project
promptctl init
```

This creates the scaffolding:
- `.promptctl/`: Do not commit this if it contains secrets or heavy logs.
- `prompts/`: Place your logic here.
- `tests/`: Place your truth data here.

## 3. The Prompt Format

We use **Frontmatter Markdown** (`.md`). This allows proper syntax highlighting in editors (VS Code) while keeping metadata structured.

**`prompts/joke.md`**
```markdown
---
name: joke-generator
model: gemini-1.5-flash
temperature: 0.9
description: Generates dad jokes based on topics.
---
Write a short, pun-based dad joke about {{topic}}.
Keep it under 20 words.
```

The `{{topic}}` is a variable slot. You can have as many as you need.

## 4. The Test Format

Tests are defined in a JSON Array. Each object is a "Case".

**`tests/jokes.json`**
```json
[
  {
    "id": "t1",
    "input": { "topic": "fruit" },
    "assert": [
      { "type": "regex", "pattern": "(apple|banana|orange|pear|fruit)", "flags": "i" }
    ]
  },
  {
    "id": "t2",
    "input": { "topic": "atoms" },
    "assert": [
      { "type": "contains", "value": "trust" }
    ]
  }
]
```

## 5. Running & Debugging

Run the eval:

```bash
promptctl eval prompts/joke.md --tests tests/jokes.json
```

If a test fails, `promptctl` returns a non-zero exit code, making it perfect for CI/CD pipelines (GitHub Actions, Jenkins, etc.).

## Next Steps

- Learn about advanced [Evaluations](evals.md).
- Connect different [Providers](providers.md).
- Visualize results with the command `promptctl dashboard`.
