# promptctl

**promptctl** is a CLI for prompt engineering, evaluation, and monitoring. It adopts a "prompt-as-code" philosophy, treating prompts and their tests as version-controlled artifacts.

## Features

- 📝 **Prompts as Code**: Define prompts in Markdown with frontmatter.
- ✅ **Test Driven**: Write test cases in JSON with assertions (equals, contains, regex, json_schema).
- 📊 **Evaluation**: Run bulk evaluations and A/B tests with statistical confidence.
- 🔍 **Tracing**: Local JSONL logs for every run with token usage and cost tracking.
- 📈 **Dashboard**: Visual dashboard to explore run history.

## Quickstart

### Installation

```bash
npm install -g pnpm
git clone https://github.com/yourusername/promptctl.git
cd promptctl
pnpm install
pnpm run build
```

Then link the CLI locally:
```bash
cd packages/cli
pnpm link --global
```
Now you can run `promptctl`.

### Initialize Project

```bash
mkdir my-prompts
cd my-prompts
promptctl init
```
This creates a `.promptctl` folder and sample `prompts/` and `tests/`.

### Run Evaluation

Ensure you have your API Key set (currently supports Google Gemini):

```bash
export GOOGLE_API_KEY=AI...
```

Run an eval:

```bash
promptctl eval prompts/sample.md --tests tests/sample.json
```

### A/B Testing

Compare two versions of a prompt:

```bash
promptctl ab prompts/v1.md prompts/v2.md --tests tests/dataset.json
```

### Dashboard

View your local run history:

```bash
promptctl dashboard
```
Open http://localhost:3000

## Environment Variables

| Variable | Description |
|Caus|---|
| `GOOGLE_API_KEY` | Required for Google Gemini provider |

## Documentation

- [Getting Started](docs/getting-started.md)
- [Providers](docs/providers.md)
- [Evaluations](docs/evals.md)

## License

MIT
