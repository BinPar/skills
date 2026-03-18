---
name: binpar-setup
description: >
  Use this skill when the user needs to set up BinPar tools, install Google
  Workspace CLI, configure Google authentication, or when any BinPar skill
  reports that gws CLI is not available. Triggers on: "setup binpar",
  "install google workspace", "configure gws", "gws not found", or when
  the user is a new team member setting up their environment.
---

# BinPar Setup

Guides through installing and authenticating the Google Workspace CLI (GWS CLI), the foundation for all BinPar skills that interact with Google Workspace.

## Step 1: Check Current State

Run these checks to determine what's already installed:

```bash
# Check if gws is installed
which gws && gws --version

# Check if authenticated
gws auth status
```

Report what's done and what's missing. Skip steps that are already complete.

## Step 2: Install GWS CLI

If `gws` is not found, install it:

```bash
npm install -g @googleworkspace/cli
```

Verify installation:
```bash
gws --version
```

If `npm` is not available, check Node.js:
```bash
node --version
```

Node.js 18+ is required. If missing or outdated, guide the user to install it via:
- `brew install node` (macOS)
- [nodejs.org](https://nodejs.org) (manual)

## Step 3: Install gcloud CLI (if missing)

Check if gcloud is installed:
```bash
which gcloud && gcloud --version | head -1
```

If not found, install it:
```bash
brew install google-cloud-sdk
```

After installation, initialize:
```bash
gcloud init
```

This is required by `gws auth setup`.

## Step 4: Configure GCP Project

BinPar has a shared GCP project for GWS CLI access: `binpar-gws-tools`. Check if gcloud is already configured to use it:

```bash
gcloud config get-value project
```

If it's not set to `binpar-gws-tools`, ask the user which project to use. Present "Use binpar-gws-tools (Recommended)" as the first option and "Create a new project" as the alternative. If they pick the existing project:

```bash
gcloud config set project binpar-gws-tools
```

If they want a new project, create one:
```bash
gcloud projects create <project-id> --name="<Project Name>"
gcloud config set project <project-id>
```

Then ensure the required APIs are enabled on the chosen project:
```bash
gcloud services enable docs.googleapis.com drive.googleapis.com sheets.googleapis.com
```

## Step 5: Authenticate with Google

The `gws auth setup` command often fails with OAuth client creation errors. The reliable flow is:

1. Ensure OAuth credentials exist. Check for `~/.config/gws/client_secret.json`. If missing, the user needs to create an OAuth Desktop client in the GCP Console:
   - Consent screen: `https://console.cloud.google.com/apis/credentials/consent?project=binpar-gws-tools`
   - Create credentials: `https://console.cloud.google.com/apis/credentials?project=binpar-gws-tools`
   - Type: **Desktop app**, Name: `gws CLI`
   - Download the JSON and save to `~/.config/gws/client_secret.json` (or ask the user to paste the JSON content)

2. Run `gws auth login` to authenticate.

**Important:** The user must select their BinPar Google Workspace account, not a personal account.

**CRITICAL — Auth URLs:** The `gws auth login` command blocks waiting for the OAuth callback, and the browser may not open automatically. To handle this:

1. Run the auth command in the background and capture its output:
   ```bash
   gws auth login > /tmp/gws-auth-output.txt 2>&1 &
   sleep 3
   cat /tmp/gws-auth-output.txt
   ```
2. Extract the `https://accounts.google.com/...` URL from the output.
3. **Always paste the full URL as text in your chat message** so the user can click/copy it. Never rely on the user seeing it in tool output alone.
4. Wait for the user to confirm they completed authorization in the browser.
5. Then check `/tmp/gws-auth-output.txt` again to verify success.

If issues persist, read `references/setup-guide.md` for the manual OAuth configuration flow.

## Step 6: Verify Authentication

Test that everything works:

```bash
gws drive files list --params '{"pageSize": 3}'
```

This should return a JSON response with up to 3 files from the user's Google Drive. If it works, authentication is complete.

## Step 7: Configure Claude Code Permissions

Suggest adding GWS CLI to the Claude Code allow list so future commands don't require manual approval:

Tell the user they can add `Bash(gws *)` to their allow list in Claude Code settings to auto-approve all GWS CLI commands. This is safe because GWS CLI only interacts with Google Workspace APIs.

## Step 8: Confirm Setup Complete

Summarize what was installed and configured:
- GWS CLI version
- Authenticated Google account
- APIs enabled
- Permissions configured

Let the user know they can now use BinPar skills that depend on Google Workspace, such as the document generator.

## Troubleshooting

Read `references/setup-guide.md` for detailed troubleshooting. Common issues:

- **Node.js < 18:** GWS CLI requires Node.js 18+. Upgrade with `brew install node` or from nodejs.org.
- **gcloud not installed:** Required by `gws auth setup`. Install with `brew install google-cloud-sdk`, then run `gcloud init`.
- **OAuth scope issues:** Re-run `gws auth setup` and ensure Docs, Drive, and Sheets APIs are enabled.
- **Corporate firewall:** The user may need to allowlist `accounts.google.com` and `oauth2.googleapis.com`.
- **Wrong account:** Run `gws auth logout` then `gws auth setup` to re-authenticate with the correct account.
