# promptctl 🚀

[![CI](https://github.com/360labs/promptctl/actions/workflows/ci.yml/badge.svg)](https://github.com/360labs/promptctl/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

**promptctl** is the definitive CLI for **Prompt Engineering as Code**. Use it to develop, assert, test, and monitor your LLM prompts with the rigor of software engineering.

---

> **Brought to you by [360labs.dev](https://360labs.dev)**  
> *We build advanced AI agents and developer tools to accelerate the next generation of software.*

---

## 🌟 Features

- **📄 Prompts as Code**: Define prompts in Markdown files with YAML frontmatter. Version control your prompts alongside your code.
- **✅ Test-Driven Development**: Write test cases in JSON. Assert output quality using exact matches, regex, semantic similarity, or JSON schema validation.
- **📊 Bulk Evaluation**: Run hundreds of test cases against your prompts in seconds. Get pass/fail rates and latency metrics instantly.
- **⚖️ A/B Testing**: Scientifically compare two versions of a prompt. Calculate win rates and statistical confidence intervals (Bootstrapping) to make data-driven decisions.
- **📈 Local Dashboard**: Visualize run history, inspect traces, and analyze costs with a built-in React-based dashboard.
- **🔌 Multi-Provider Support**: First-class support for Google Gemini, with extensible architecture for OpenAI, Anthropic, and local models.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/360labs/promptctl.git
cd promptctl
pnpm install
pnpm run build
```

Link the CLI globally to use `promptctl` anywhere:

```bash
cd packages/cli
pnpm link --global
```

### Initialize a Project

Navigate to your workspace and initialize the directory structure:

```bash
mkdir my-ai-project
cd my-ai-project
promptctl init
```

This generates:
- `prompts/`: Directory for your Markdown prompt files.
- `tests/`: Directory for your JSON test cases.
- `.promptctl/`: Local configuration and logging directory.

## 📖 Usage Guide

### 1. Write a Prompt

Create `prompts/sentiment.md`. Use `{{variable}}` syntax for dynamic inputs.

```markdown
---
name: sentiment-classifier
model: gemini-1.5-flash
temperature: 0.0
max_output_tokens: 128
---
You are a sentiment analysis expert.
Classify the following review as POSITIVE, NEGATIVE, or NEUTRAL.

Review: "{{review}}"
Classification:
```

### 2. Define Tests

Create `tests/sentiment.json`. Define inputs and expected assertions.

```json
[
  {
    "id": "case-1",
    "input": { "review": "The product exceeded my expectations in every way!" },
    "assert": [{ "type": "contains", "value": "POSITIVE" }]
  },
  {
    "id": "case-2",
    "input": { "review": "It arrived broken and support was unhelpful." },
    "assert": [{ "type": "contains", "value": "NEGATIVE" }]
  }
]
```

### 3. Run Evaluation

Set your API key (currently supporting Google Gemini):

```bash
export GOOGLE_API_KEY=AIzaSy...
```

Run the evaluation:

```bash
promptctl eval prompts/sentiment.md --tests tests/sentiment.json
```

**Output:**

| Test ID | Pass | Score | Latency | Tokens | Cost ($) |
|---------|------|-------|---------|--------|----------|
| case-1  | PASS | 1.0   | 450ms   | 45     | 0.000002 |
| case-2  | PASS | 1.0   | 412ms   | 48     | 0.000002 |

### 4. A/B Testing

Compare `prompts/v1.md` against `prompts/v2.md` to see if your changes actually improved performance.

```bash
promptctl ab prompts/v1.md prompts/v2.md --tests tests/sentiment.json
```

Promptctl will run both prompts against the dataset and compute a **95% Confidence Interval** on the performance delta.

### 5. Dashboard

Launch the local analysis dashboard to browse history:

```bash
promptctl dashboard
```

Open `http://localhost:3000` to view your execution logs, costs, and traces.

## 📚 Documentation

Detailed documentation is available in the [`docs/`](docs/) directory:

- [**Getting Started**](docs/getting-started.md): detailed setup guide.
- [**Writing Assertions**](docs/evals.md): learn about `equals`, `regex`, `json_schema`, and more.
- [**Providers**](docs/providers.md): configuring Google, OpenAI, etc.

## 🏗️ Architecture

Promptctl is a **monorepo** managed by Turbo and pnpm workspaces:

- `packages/core`: The heart of the logic (eval runner, A/B engine, assertions).
- `packages/cli`: The terminal interface.
- `packages/providers`: LLM API adapters.
- `packages/dashboard`: Vite + Express visualization tool.
- `packages/trace`: Structured JSONL logging and cost calculation.

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to set up your dev environment and submit PRs.

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<p align="center">
  Built with ❤️ by <a href="https://360labs.dev">360labs.dev</a>
</p>
