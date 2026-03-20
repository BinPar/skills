# Notion MCP Server - Setup Guide

Comprehensive reference for configuring the Notion MCP server for both Claude Code and Codex.

## Overview

Notion provides an official hosted MCP server at `https://mcp.notion.com/mcp`. It allows both Claude Code and Codex to read, create, and update Notion pages and databases directly via tool calls.

- **Server URL:** `https://mcp.notion.com/mcp`
- **Transport:** HTTP (Streamable HTTP, hosted by Notion)
- **Auth:** OAuth 2.0 (browser-based, automatic — no manual token needed)
- **Docs:** https://developers.notion.com/llms.txt

> **Note:** The npm package `@notionhq/notion-mcp-server` (open-source server) is no longer actively maintained. Always use the hosted server at `mcp.notion.com`.

## Shared Setup Strategy

### Step 1: Register the MCP Server

Use `mcp-remote` as a STDIO bridge to Notion's hosted server. The team uses this path in both runtimes so setup and troubleshooting stay consistent. Run only the command that matches the current runtime.

```bash
# Claude Code
claude mcp add --scope user notion -- npx -y mcp-remote https://mcp.notion.com/mcp

# Codex
codex mcp add notion -- npx -y mcp-remote https://mcp.notion.com/mcp
```

> **Why standardize on `mcp-remote`?** Claude Code has known HTTP OAuth edge cases, and the shared `mcp-remote` bridge gives both runtimes the same OAuth and troubleshooting path.

Scope options:
- `--scope user` (recommended): Available across all projects for this user
- `--scope local` (default): Available only in the current project
- `--scope project`: Shared with team via `.mcp.json` file

Codex does not currently use the same `--scope` flag shape, so the Codex command above omits it.

### Step 2: Authenticate via OAuth

Restart the current runtime after registering. On first use of a Notion tool, `mcp-remote` opens the browser automatically for OAuth:

1. Browser opens with Notion's authorization page
2. Sign in to Notion
3. Select **only the Read Garden space** — no other workspaces
4. Click **"Allow access"**
5. Terminal shows success — the MCP server is authenticated
6. OAuth tokens are cached in `~/.mcp-auth/`

### Step 3: Verify Connection

Use the Notion MCP tools in the current runtime to verify:
- Search for pages to confirm access
- Confirm the "Docs" database is accessible

## Managing the Server

### List registered servers

```bash
# Claude Code
claude mcp list

# Codex
codex mcp list
```

In Claude Code, `/mcp` is a convenient UI entrypoint. In Codex, use `codex mcp list` plus a live Notion tool call in-session.

### Remove the server

```bash
# Claude Code
claude mcp remove notion

# Codex
codex mcp remove notion
```

### Re-authenticate

Remove cached OAuth state and re-add the server to trigger a fresh OAuth flow:

```bash
rm -rf ~/.mcp-auth/

# Claude Code
claude mcp remove notion
claude mcp add --scope user notion -- npx -y mcp-remote https://mcp.notion.com/mcp

# Codex
codex mcp remove notion
codex mcp add notion -- npx -y mcp-remote https://mcp.notion.com/mcp
```

Then restart the current runtime and use a Notion tool to trigger the OAuth flow again.

## Access Scoping (Read Garden Only)

During the OAuth consent screen, Notion asks which pages/spaces to grant access to. The user MUST:

- **Select only Read Garden** and its pages
- **Do NOT select** other workspaces or personal spaces

This ensures the integration is scoped correctly:
- All child pages and databases under Read Garden are accessible
- The "Docs" database (inside Read Garden) is accessible
- No other team or personal data is exposed

## Claude-specific Optional Plugin

For a richer experience, install the [Notion plugin for Claude Code](https://github.com/makenotion/claude-code-notion-plugin). It bundles the MCP server along with pre-built Skills and slash commands for common Notion workflows.

## Rate Limits

The Notion API enforces these rate limits:

| Operation | Limit |
|-----------|-------|
| Standard requests | 180 requests/minute |
| Search requests | 30 requests/minute |

If you hit a rate limit, the API returns HTTP 429. Wait at least 1 second before retrying.

For document generation, typical usage is well within limits (~10-20 requests per document).

## Available MCP Tools

Once configured, the Notion MCP server exposes runtime-specific Notion tools.

Codex currently exposes tools such as:

| Tool | Purpose |
|------|---------|
| `mcp__notion__notion_search` | Search pages and databases |
| `mcp__notion__notion_fetch` | Fetch a page, database, or data source |
| `mcp__notion__notion_create_pages` | Create pages with properties and content |
| `mcp__notion__notion_update_page` | Update page properties or content |

Claude Code should use the equivalent current official Notion MCP tools exposed in that runtime. Do not assume older REST-style names such as `create_page` or `append_block_children` are still present without verifying them first.

## Troubleshooting

### PKCE code_verifier error (with native HTTP transport)

If native HTTP transport fails in either runtime, switch back to the shared `mcp-remote` bridge:

```bash
# Claude Code
claude mcp remove notion
claude mcp add --scope user notion -- npx -y mcp-remote https://mcp.notion.com/mcp

# Codex
codex mcp remove notion
codex mcp add notion -- npx -y mcp-remote https://mcp.notion.com/mcp
```

### OAuth flow doesn't start

- Restart the current runtime and retry a Notion tool call
- Verify the server is registered: `claude mcp list` or `codex mcp list`
- If not listed, re-add it with the matching runtime command above

### Browser doesn't open for OAuth

- Ensure a browser is accessible from the system
- In Claude Code, try `/mcp` to inspect the server status
- In Codex, trigger any Notion tool from a live session
- Check if a firewall blocks `mcp.notion.com`

### Wrong workspace selected during OAuth

- Clear cached OAuth state: `rm -rf ~/.mcp-auth/`
- Remove the server for the current runtime
- Re-add it with the matching `mcp-remote` command above
- Restart the current runtime and complete OAuth again - this time select **only Read Garden**

### OAuth token expired / auth stopped working

- Clear cached state: `rm -rf ~/.mcp-auth/`
- Restart the current runtime to trigger a fresh OAuth flow

### No access to pages (empty search results)

- During OAuth, the user must grant access to the Read Garden space and its pages
- If they selected a different space or no pages, re-authorize (see above)

### "Docs" database not found

- The database must be inside the Read Garden space (authorized area)
- Search by exact name — database names are case-sensitive
- If the database was recently created, it may take a moment to become searchable
- Ask the user for the database URL and extract the ID manually

### Rate limited (429 errors)

- Wait 1-2 seconds and retry
- Batch operations when possible
- Search is more aggressively limited (30/min) — cache results when feasible

### Last resort: local server with API token

If `mcp-remote` also fails, use the open-source local server with a manual Notion API token:

1. Create a Notion integration at `https://www.notion.so/profile/integrations`
2. Copy the token (starts with `ntn_`)
3. Share your Notion pages/databases with the integration
4. Register with token:

```bash
# Claude Code
claude mcp remove notion
claude mcp add --scope user notion -e NOTION_TOKEN=ntn_YOUR_TOKEN -- npx -y @notionhq/notion-mcp-server

# Codex
codex mcp remove notion
codex mcp add notion --env NOTION_TOKEN=ntn_YOUR_TOKEN -- npx -y @notionhq/notion-mcp-server
```

Note: this package is no longer actively maintained but works as a fallback.

## Security

- **OAuth-based:** No tokens stored in config files — OAuth handles authentication securely
- **Scope access narrowly:** Only authorize Read Garden during the OAuth consent
- **Re-authorize if compromised:** Remove and re-add the server to trigger a fresh OAuth flow
- **Hosted by Notion:** The MCP server runs on Notion's infrastructure, not locally
