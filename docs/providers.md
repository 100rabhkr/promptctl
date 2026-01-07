# Providers

Currently, promptctl supports the following providers:

## Google

Uses the Gemini API via `@google/generative-ai`.

**Configuration:**
Set `GOOGLE_API_KEY` environment variable.

Supported Models:
- `gemini-3-pro-preview`
- `gemini-3-pro-image-preview`
- `gemini-3-flash-preview`
- `gemini-2.5-flash`
- `gemini-2.5-flash-preview-09-2025`
- `gemini-2.5-flash-image`
- `gemini-2.5-flash-native-audio-preview-12-2025`
- `gemini-2.5-flash-preview-tts`
- `gemini-2.5-flash-lite`
- `gemini-2.5-flash-lite-preview-09-2025`
- `gemini-2.5-pro`
- `gemini-2.5-pro-preview-tts`
- `gemini-2.0-flash`
- `gemini-2.0-flash-preview-image-generation`
- `gemini-2.0-flash-lite`
- `gemini-1.5-flash`
- `gemini-1.5-pro`
- `gemini-1.0-pro`

## Anthropic (Claude)

Uses the Anthropic API via `@anthropic-ai/sdk`.

**Configuration:**
Set `ANTHROPIC_API_KEY` environment variable.

**Usage:**
```bash
promptctl eval prompts/my-prompt.md --tests tests/my-tests.json --provider anthropic
```

Supported Models:
- `claude-opus-4-20250514`
- `claude-sonnet-4-20250514`
- `claude-3-7-sonnet-20250219`
- `claude-3-5-sonnet-20241022`
- `claude-3-5-haiku-20241022`
- `claude-3-opus-20240229`
- `claude-3-sonnet-20240229`
- `claude-3-haiku-20240307`

## Kimi-K2

Uses the Moonshot AI API (OpenAI-compatible).

**Configuration:**
Set `KIMI_API_KEY` environment variable.

**Usage:**
```bash
promptctl eval prompts/my-prompt.md --tests tests/my-tests.json --provider kimi
```

Supported Models:
- `kimi-k2-0711-preview`
- `moonshot-v1-8k`
- `moonshot-v1-32k`
- `moonshot-v1-128k`

## OpenAI

Uses LangChain with OpenAI backend.

**Configuration:**
Set `OPENAI_API_KEY` environment variable.

**Usage:**
```bash
promptctl eval prompts/my-prompt.md --tests tests/my-tests.json --provider openai
```

Supported Models:
- `gpt-4o`
- `gpt-4o-mini`
- `gpt-4-turbo`
- `gpt-3.5-turbo`
- `o1`
- `o1-mini`

## LangChain + LangSmith

LangChain providers with built-in LangSmith tracing for evals.

**Configuration:**
```bash
# Required for the model backend
export OPENAI_API_KEY="your-key"      # for langchain-openai
export ANTHROPIC_API_KEY="your-key"   # for langchain-anthropic
export GOOGLE_API_KEY="your-key"      # for langchain-google

# Required for LangSmith tracing
export LANGSMITH_API_KEY="your-langsmith-key"
```

**Usage:**
```bash
# With OpenAI backend + LangSmith tracing
promptctl eval prompts/my-prompt.md --tests tests/my-tests.json --provider langchain-openai

# With Anthropic backend + LangSmith tracing
promptctl eval prompts/my-prompt.md --tests tests/my-tests.json --provider langchain-anthropic

# With Google backend + LangSmith tracing
promptctl eval prompts/my-prompt.md --tests tests/my-tests.json --provider langchain-google
```

Traces will appear in your LangSmith dashboard under the project `promptctl-evals`.
