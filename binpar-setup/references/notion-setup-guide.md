# Notion MCP Server — Setup Guide

Comprehensive reference for configuring the Notion MCP server with Claude Code.

## Overview

Notion provides an official hosted MCP server at `https://mcp.notion.com/mcp`. It allows Claude Code to read, create, and update Notion pages and databases directly via tool calls.

- **Server URL:** `https://mcp.notion.com/mcp`
- **Transport:** HTTP (Streamable HTTP, hosted by Notion)
- **Auth:** OAuth 2.0 (browser-based, automatic — no manual token needed)
- **Docs:** https://developers.notion.com/llms.txt

> **Note:** The npm package `@notionhq/notion-mcp-server` (open-source server) is no longer actively maintained. Always use the hosted server at `mcp.notion.com`.

## Setup for Claude Code

### Step 1: Register the MCP Server

```bash
claude mcp add --transport http --scope user notion https://mcp.notion.com/mcp
```

Scope options:
- `--scope user` (recommended): Available across all projects for this user
- `--scope local` (default): Available only in the current project
- `--scope project`: Shared with team via `.mcp.json` file

### Step 2: Authenticate via OAuth

Run `/mcp` in Claude Code to see the server status. On first use of a Notion tool (or via `/mcp`), the OAuth flow starts automatically:

1. Browser opens with Notion's authorization page
2. Sign in to Notion
3. Select **only the Read Garden space** — no other workspaces
4. Click **"Allow access"**
5. Done — the MCP server is authenticated

### Step 3: Verify Connection

Use the Notion MCP tools to verify:
- Search for pages to confirm access
- Confirm the "Docs" database is accessible

## Managing the Server

### List registered servers

```bash
claude mcp list
```

### Check status in Claude Code

Run `/mcp` inside Claude Code to see all MCP servers and their connection status.

### Remove the server

```bash
claude mcp remove notion
```

### Re-authenticate

Remove and re-add the server to trigger a fresh OAuth flow:

```bash
claude mcp remove notion
claude mcp add --transport http --scope user notion https://mcp.notion.com/mcp
```

Then use `/mcp` or a Notion tool to trigger the OAuth flow again.

## Access Scoping (Read Garden Only)

During the OAuth consent screen, Notion asks which pages/spaces to grant access to. The user MUST:

- **Select only Read Garden** and its pages
- **Do NOT select** other workspaces or personal spaces

This ensures the integration is scoped correctly:
- All child pages and databases under Read Garden are accessible
- The "Docs" database (inside Read Garden) is accessible
- No other team or personal data is exposed

## Notion Plugin for Claude Code

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

Once configured, the Notion MCP server provides these tools (prefixed with `mcp__notion__`):

| Tool | Purpose |
|------|---------|
| `search` | Search pages and databases by title |
| `query_database` | Query a database with filters and sorts |
| `get_page` | Get page properties |
| `create_page` | Create a new page (in a database or as child of page) |
| `update_page` | Update page properties |
| `get_block_children` | Get child blocks of a page/block |
| `append_block_children` | Append content blocks to a page |
| `update_block` | Update an existing block |
| `delete_block` | Delete a block |
| `get_database` | Get database schema (properties) |

## Troubleshooting

### OAuth flow doesn't start

- Run `/mcp` in Claude Code to check the server status
- Verify the server is registered: `claude mcp list`
- If not listed, re-add: `claude mcp add --transport http --scope user notion https://mcp.notion.com/mcp`

### Browser doesn't open for OAuth

- Ensure a browser is accessible from the system
- Try running `/mcp` in Claude Code to manually trigger authentication
- Check if a firewall blocks `mcp.notion.com`

### Wrong workspace selected during OAuth

- Remove the server: `claude mcp remove notion`
- Re-add it: `claude mcp add --transport http --scope user notion https://mcp.notion.com/mcp`
- Complete OAuth again — this time select **only Read Garden**

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
- Batch operations when possible (e.g., append multiple blocks in one call)
- Search is more aggressively limited (30/min) — cache results when feasible

### STDIO fallback (if HTTP transport not supported)

If Claude Code's HTTP transport has issues, use the `mcp-remote` bridge as a STDIO fallback:

```bash
claude mcp add notion -- npx -y mcp-remote https://mcp.notion.com/mcp
```

As a last resort, the [open-source MCP server](https://github.com/makenotion/notion-mcp-server) can be run locally with a Notion API token, though it is no longer actively maintained.

## Security

- **OAuth-based:** No tokens stored in config files — OAuth handles authentication securely
- **Scope access narrowly:** Only authorize Read Garden during the OAuth consent
- **Re-authorize if compromised:** Remove and re-add the server to trigger a fresh OAuth flow
- **Hosted by Notion:** The MCP server runs on Notion's infrastructure, not locally
