# Togather — agent rules

## Always use codebase-memory MCP for code exploration

This project is indexed in the `codebase-memory-mcp` knowledge graph.
**Prefer the graph over `grep`/`Read`/`Bash find` for anything structural.** A graph
query costs ~500 tokens; grepping and reading whole files costs tens of thousands.

Project handle (exact — it is the repo path with `-` instead of separators):

```
project = "C-Users-kalis-Togather"
```

### First call in any session

1. `index_status(project)` — confirm `status: ready` and the `indexed_at` generation.
2. If it is missing/stale, `index_repository(repo_path="C:\\Users\\kalis\\Togather", mode="full")`.
   A git watcher is active (poll 5s), so edits normally re-index themselves.

### Which tool for which question

| Question | Tool |
|---|---|
| Where is symbol X / what matches a name | `search_graph(name_pattern=...)` |
| Who calls X | `trace_path(function_name="X", direction="inbound")` |
| What does X call | `trace_path(..., direction="outbound")` |
| Full call context | `trace_path(..., direction="both")` |
| Read a specific function body | `get_code_snippet(qualified_name=...)` |
| Project layout, entry points, hotspots, layers | `get_architecture(aspects=[...])` |
| Dead code / unused | `search_graph(max_degree=0, exclude_entry_points=true)` |
| Multi-hop or aggregate questions | `query_graph` (Cypher) |
| "What does my diff affect" | `detect_changes` |
| Find tier / unknown symbol | `search_code` (graph-ranked, better than grep) |

### Fall back to `Read`/`Grep` only when

- the graph returns nothing and you need to confirm absence, or
- `check_index_coverage` flags the file as partial/skipped/stale, or
- you are reading a non-code file (markdown, JSON, config, SQL migrations).

Call `check_index_coverage` with the evidence paths before making any
**negative, exhaustive, dead-code, or complete-impact** claim. A clean result
means "no recorded gap", not proof of completeness — say so when it matters.

### Gotchas

- `trace_path` needs exact names; resolve them with `search_graph(name_pattern=...)` first.
- `search_graph` pages at 50 — check `has_more` and use `offset`.
- `query_graph` has a 100k row ceiling; add a Cypher `LIMIT`.
- `search_graph(relationship="HTTP_CALLS")` filters by degree, not edges — use `query_graph` for real edges.

## Project facts

- Next.js **16.4.3** App Router, React 19, Tailwind **v3**, Prisma 6.19.3 + PostGIS, next-auth 5 beta.
- Read `node_modules/next/dist/docs/` before writing Next-specific code — this version differs
  from training data. Notably: middleware is now `proxy.ts` (export `proxy`), and route-handler
  `params` is a `Promise`.
- Known build break: `src/app/api/communities/[id]/join/route.ts` and
  `src/app/api/events/[id]/rsvp/route.ts` import `getServerSession` from `next-auth`,
  which v5 does not export. Use `auth()` from `@/lib/auth`.
