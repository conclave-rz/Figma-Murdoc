# Figma Console MCP

The most comprehensive MCP server for Figma — design tokens, components, variables, and programmatic design creation.

## Build & Test

```bash
npm run build          # Compiles local + cloudflare + apps
npm run build:local    # Local mode only (use if Cloudflare types fail)
npm test               # Jest test suite
npx tsc --noEmit       # Type-check (pre-existing errors in src/apps/*/ui/mcp-app.ts are expected)
```

## Release Process

Before any release, read `.notes/RELEASING.md` and follow all five phases. Run `scripts/release.sh` for automated version/count updates before manual content edits.

## Known Issues

- ~~**Cloudflare build type error**~~: fixed — the three `this.env as Env` casts in `src/index.ts` are now `as unknown as Env`, so `npm run build:cloudflare` exits 0 and the full `npm run build` chain (which `prepublishOnly` runs) succeeds.
- **Sin publicación a npm (Murdoc)**: el `publish.yml` heredado de upstream se eliminó y `package.json` es `private`. Murdoc se usa desde un clon; un tag `v*` no publica nada. Al mergear upstream, no restaurar ese workflow.
- **Pre-existing tsc errors**: `src/apps/*/ui/mcp-app.ts` DOM type errors are expected (separate tsconfig files).

## Architecture

- Entry points: `src/local.ts` (local/NPX mode), `src/index.ts` (Cloudflare Workers)
- Tool registration: `registerXxxTools(server, getFigmaAPI, ...)` pattern in `src/tools/`
- Desktop Bridge: WebSocket (`src/core/websocket-server.ts`)
- Schema compatibility: No `z.any()` — Gemini requires strictly typed Zod schemas
