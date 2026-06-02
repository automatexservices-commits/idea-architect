# Spec Generator

This small tool fills Markdown templates using AI (OpenAI) or a user-provided JSON.

Usage

- Provide a template (see `templates/` for examples). Templates use `{{placeholder}}` markers.
- Either set `OPENAI_API_KEY` in your environment or pass `--apiKey`.

Example (with env var):

```bash
export OPENAI_API_KEY=sk-...
node tools/spec-generator/generate_spec.js --template tools/spec-generator/templates/prd.m.tpl --output out/prd.md --brief "Short project brief here"
```

If you don't provide an API key the script writes a `*.values.json` next to the output for you to fill manually.

Templates provided:

- `templates/prd.m.tpl`
- `templates/architecture.m.tpl`
- `templates/design-system.m.tpl`
- `templates/readme.m.tpl`

Notes

- The generator expects the OpenAI Chat Completions API at `https://api.openai.com/v1/chat/completions`.
- Adjust `model` via `--model` if needed. Default: `gpt-4o-mini`.
