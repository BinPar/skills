---
name: binpar-setup
description: >
  Use this skill when the user needs to set up BinPar tools, install Google
  Workspace CLI, configure Google authentication, configure Notion MCP,
  or when any BinPar skill reports that gws CLI or Notion is not available.
  Triggers on: "setup binpar", "install google workspace", "configure gws",
  "gws not found", "configure notion", "setup notion mcp", "notion integration",
  or when the user is a new team member setting up their environment.
---

# BinPar Setup

Guides through installing and authenticating the Google Workspace CLI (GWS CLI) and optionally the Notion MCP server — the foundations for all BinPar skills that interact with Google Workspace and Notion.

The setup should be fully interactive, easy, and require minimal user effort. Ask questions, provide defaults, and guide the user step by step.

## Step 1: Check Current State

Run these checks in parallel to determine what's already installed:

```bash
# Check if gws is installed
which gws && gws --version

# Check if authenticated
gws auth status

# Check gcloud
which gcloud && gcloud --version | head -1

# Check Node.js
node --version
```

Report a brief summary of what's done and what's missing. Skip steps that are already complete.

## Step 2: Install Prerequisites

Install anything missing in order. Only do what's needed:

1. **Node.js 18+** (if missing): `brew install node` (macOS) or guide to nodejs.org
2. **GWS CLI** (if missing): `npm install -g @googleworkspace/cli`
3. **gcloud CLI** (if missing): `brew install google-cloud-sdk`

## Step 3: Authenticate gcloud

Check if gcloud is already authenticated:
```bash
gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>&1
```

If no active account, authenticate using `expect` to handle the interactive prompt:

**CRITICAL — gcloud auth is interactive.** It prompts for a verification code via stdin. You CANNOT just run it in the background and pipe the code later — the session dies. Use this `expect`-based approach:

1. Create and run an expect script that keeps the session alive and waits for the code via a file:
   ```bash
   cat > /tmp/gcloud-auth.exp << 'EXPECT'
   #!/usr/bin/expect -f
   set timeout 300
   log_file -noappend /tmp/gcloud-auth-log.txt
   spawn gcloud auth login --no-launch-browser
   expect "verification code"
   set f [open "/tmp/gcloud-auth-ready" w]
   puts $f "ready"
   close $f
   while {![file exists /tmp/gcloud-auth-code.txt]} { sleep 1 }
   set f [open "/tmp/gcloud-auth-code.txt" r]
   set code [string trim [read $f]]
   close $f
   send "$code\r"
   expect {
       "You are now logged in" {
           set f [open "/tmp/gcloud-auth-result.txt" w]; puts $f "SUCCESS"; close $f
       }
       "ERROR" {
           set f [open "/tmp/gcloud-auth-result.txt" w]; puts $f "FAILED"; close $f
       }
       timeout {
           set f [open "/tmp/gcloud-auth-result.txt" w]; puts $f "TIMEOUT"; close $f
       }
   }
   expect eof
   EXPECT
   rm -f /tmp/gcloud-auth-ready /tmp/gcloud-auth-code.txt /tmp/gcloud-auth-result.txt /tmp/gcloud-auth-log.txt
   expect -f /tmp/gcloud-auth.exp &
   for i in $(seq 1 20); do [ -f /tmp/gcloud-auth-ready ] && break; sleep 1; done
   cat /tmp/gcloud-auth-log.txt 2>/dev/null
   ```
2. Extract the `https://accounts.google.com/...` URL from the log output.
3. **Always paste the full URL as text in your chat message** so the user can click/copy it.
4. Tell the user to open the URL, sign in, and paste the verification code back.
5. When the user provides the code, write it to the file and wait for the result:
   ```bash
   echo "THE_CODE_HERE" > /tmp/gcloud-auth-code.txt
   for i in $(seq 1 20); do [ -f /tmp/gcloud-auth-result.txt ] && break; sleep 1; done
   cat /tmp/gcloud-auth-result.txt
   cat /tmp/gcloud-auth-log.txt | tail -5
   ```

## Step 4: Configure GCP Project

Check current gcloud project:
```bash
gcloud config get-value project
```

If not set to `binpar-gws-tools`, ask the user which project to use:
- **Use binpar-gws-tools (Recommended)** — BinPar's shared project, already has APIs enabled
- **Create a new project** — for custom setups

For the recommended option:
```bash
gcloud config set project binpar-gws-tools
```

Then verify the required APIs are enabled (requires gcloud to be authenticated first):
```bash
gcloud services list --enabled --filter="name:(docs.googleapis.com OR drive.googleapis.com OR sheets.googleapis.com)" --format="value(name)"
```

If any are missing, enable them:
```bash
gcloud services enable docs.googleapis.com drive.googleapis.com sheets.googleapis.com
```

## Step 5: Configure OAuth Credentials

Check if `~/.config/gws/client_secret.json` already exists. If it does, skip to Step 6.

If missing, ask the user to paste the OAuth credentials JSON. They should have received this from their team lead. Prompt them like:

> To authenticate, I need the OAuth credentials JSON for the BinPar GWS project. Your team lead should have shared this with you. Please paste the JSON content here.

Once the user pastes the JSON (it should look like `{"installed":{"client_id":"...","client_secret":"..."}}`), save it:

```bash
mkdir -p ~/.config/gws
```

Then write the JSON to `~/.config/gws/client_secret.json`.

If the user doesn't have the JSON, direct them to their team lead or point them to the GCP Console to create a Desktop OAuth client:
- Consent screen: `https://console.cloud.google.com/apis/credentials/consent?project=binpar-gws-tools`
- Credentials: `https://console.cloud.google.com/apis/credentials?project=binpar-gws-tools`

## Step 6: Authenticate GWS CLI

**CRITICAL — GWS uses a TUI (terminal UI)** that prevents capturing its output normally. You MUST disable the TUI with environment variables to capture the auth URL. Use this approach:

1. Run with `CI=true NO_COLOR=1 TERM=dumb` to disable the TUI. The URL is printed to **stderr**, so redirect accordingly:
   ```bash
   CI=true NO_COLOR=1 TERM=dumb gws auth login 2>/tmp/gws-auth-err.txt > /tmp/gws-auth-out.txt &
   GWS_PID=$!
   sleep 8
   cat /tmp/gws-auth-err.txt
   ```
2. Extract the `https://accounts.google.com/...` URL from stderr output.
3. **Always paste the full URL as text in your chat message** so the user can click/copy it. Never rely on the user seeing it in tool output alone.
4. Tell the user to open the URL and sign in with their **BinPar corporate Google account**.
5. Wait for the user to confirm they completed authorization (the local callback server handles the code exchange automatically).
6. Then check the output files to verify success:
   ```bash
   cat /tmp/gws-auth-out.txt
   cat /tmp/gws-auth-err.txt
   ```

## Step 7: Verify Authentication

Test that everything works:

```bash
CI=true gws drive files list --params '{"pageSize": 3}'
```

This should return a JSON response with files from the user's Google Drive.

## Step 8: Configure Claude Code Permissions

Suggest adding GWS CLI to the Claude Code allow list so future commands don't require manual approval:

Tell the user they can add `Bash(gws *)` to their allow list in Claude Code settings to auto-approve all GWS CLI commands.

## Step 9: Confirm Google Setup Complete

Summarize what was installed and configured:
- GWS CLI version
- Authenticated Google account
- GCP project
- APIs enabled

Let the user know they can now use BinPar skills that depend on Google Workspace.

## Step 10: Ask About Notion Setup

After completing Google setup, ask the user if they also want to configure the Notion MCP server for internal document generation. Use AskUserQuestion with options:

- **Yes, set up Notion** (Recommended) — enables creating documents directly in Notion
- **Skip for now** — can be set up later

If the user skips, jump to Step 14 (final summary).

## Step 11: Add Notion MCP Server

Read `references/notion-setup-guide.md` for detailed reference.

### 11.1 Check if already configured

Check if the Notion MCP server is already registered:

```bash
claude mcp list 2>&1 | grep -i notion
```

If already present and working, skip to Step 12.

### 11.2 Register the Notion MCP server

Use the `claude mcp add` command to register Notion's hosted MCP server. Use `--scope user` so it's available across all projects:

```bash
claude mcp add --transport http --scope user notion https://mcp.notion.com/mcp
```

This registers the official Notion MCP server (hosted by Notion, OAuth-based). No npm packages, no tokens, no manual config editing.

### 11.3 Authenticate via OAuth

Tell the user to run `/mcp` inside Claude Code to see the server status and trigger authentication.

When they interact with a Notion tool for the first time (or via `/mcp`), the OAuth flow starts:
1. Browser opens automatically with Notion's authorization page
2. User signs in to Notion (if not already)
3. User selects which workspace and pages to grant access to
4. User clicks **"Allow access"**
5. Authorization completes and the MCP server is ready

**CRITICAL — Read Garden only:** When the OAuth consent screen asks which pages to connect, the user MUST select **only the Read Garden space** (and its pages). Do **not** grant access to other workspaces — this scopes the integration's access correctly.

## Step 12: Verify Notion Connection

After the user completes the OAuth flow, verify the connection works using the Notion MCP tools:

- Search for pages to confirm access
- Look for the "Docs" database

If the tools aren't available yet, tell the user to run `/mcp` to check the server status and complete authentication if needed.

## Step 13: Final Summary

Summarize everything that was installed and configured:

**Google Workspace:**
- GWS CLI version
- Authenticated Google account
- GCP project
- APIs enabled

**Notion** (if configured):
- Notion MCP server registered (`https://mcp.notion.com/mcp`)
- OAuth authentication completed (browser-based)
- Connected to Read Garden space
- Scope: user (available across all projects)

Let the user know they can now use all BinPar skills, including generating documents in both Google Docs and Notion.

**Tip:** Mention the [Notion plugin for Claude Code](https://github.com/makenotion/claude-code-notion-plugin) — it bundles pre-built Skills and slash commands for common Notion workflows, providing a richer experience on top of the MCP server.

## Troubleshooting

Read `references/setup-guide.md` for Google troubleshooting and `references/notion-setup-guide.md` for Notion troubleshooting. Common issues:

### Google Workspace
- **Node.js < 18:** GWS CLI requires Node.js 18+. Upgrade with `brew install node` or from nodejs.org.
- **gcloud not installed:** Install with `brew install google-cloud-sdk`.
- **OAuth scope issues:** Re-run `gws auth login` and ensure Docs, Drive, and Sheets APIs are enabled.
- **Corporate firewall:** The user may need to allowlist `accounts.google.com` and `oauth2.googleapis.com`.
- **Wrong account:** Run `gws auth logout` then redo Step 6 to re-authenticate with the correct account.
- **Browser doesn't open:** Use `CI=true NO_COLOR=1 TERM=dumb` env vars to disable the TUI and capture the URL from stderr.
- **gcloud verification code mismatch:** Each `gcloud auth login` session generates a unique code challenge. The verification code is tied to that specific session. Never kill and restart the process — the old code won't work with a new session. Use the expect-based approach in Step 3.

### Notion
- **OAuth flow doesn't start:** Run `/mcp` in Claude Code to check the server status and trigger authentication.
- **Server not listed:** Re-run `claude mcp add --transport http --scope user notion https://mcp.notion.com/mcp`.
- **Wrong workspace selected during OAuth:** Disconnect and reconnect — use `/mcp` to manage the server, or run `claude mcp remove notion` then re-add and re-authenticate. Select only Read Garden.
- **No access to pages:** During OAuth, the user must select the Read Garden space and its pages. If they selected a different space, re-authorize.
- **"Docs" database not found:** The integration only sees pages/databases in the authorized space. Verify Read Garden was selected during OAuth.
- **Rate limited:** Notion API allows 180 req/min (30 req/min for search). Wait and retry if you hit limits.
- **Tool doesn't support remote MCP:** Use STDIO fallback with `mcp-remote` bridge: `claude mcp add notion -- npx -y mcp-remote https://mcp.notion.com/mcp`.
