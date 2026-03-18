# Google Workspace CLI — Setup Guide

Comprehensive reference for installing, authenticating, and troubleshooting the Google Workspace CLI.

## Prerequisites

- **Node.js 18+** — check with `node --version`
- **npm** — comes with Node.js
- **BinPar Google Workspace account** — your @binpar.com email
- **Browser access** — for OAuth authentication flow

Optional:
- **gcloud CLI** — Google Cloud SDK, useful for advanced configuration but not required

## Installation Options

### Option A: npm (recommended)

```bash
npm install -g @googleworkspace/cli
```

### Option B: npx (no global install)

```bash
npx @googleworkspace/cli auth setup
```

Use `npx @googleworkspace/cli` as prefix for all commands instead of `gws`.

### Verify Installation

```bash
gws --version
gws --help
```

## Authentication Walkthrough

### Automated Setup

```bash
gws auth setup
```

The interactive wizard handles everything:

1. **Account selection** — Choose your BinPar Google Workspace account
2. **GCP project** — Select an existing project or create a new one (e.g., "binpar-claude-tools")
3. **API enablement** — Automatically enables:
   - Google Docs API
   - Google Drive API
   - Google Sheets API
4. **OAuth consent** — Configures OAuth consent screen (internal to your organization)
5. **Browser auth** — Opens browser for Google sign-in and consent
6. **Credential storage** — Encrypted with AES-256-GCM, stored in OS keyring

### Manual OAuth Configuration

If `gws auth setup` fails, configure manually:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create or select a project
3. Enable APIs:
   - Navigate to APIs & Services > Library
   - Enable: Google Docs API, Google Drive API, Google Sheets API
4. Create OAuth credentials:
   - APIs & Services > Credentials > Create Credentials > OAuth client ID
   - Application type: Desktop app
   - Download the JSON file
5. Authenticate:
   ```bash
   gws auth login --client-id YOUR_CLIENT_ID --client-secret YOUR_CLIENT_SECRET
   ```

## Auth Management

### Check status
```bash
gws auth status
```

### Re-authenticate
```bash
gws auth login
```

### Logout
```bash
gws auth logout
```

### Switch accounts
```bash
gws auth logout
gws auth setup  # select different account
```

## Multi-Account Management

GWS CLI supports one active account at a time. To switch between accounts:

```bash
# Check current account
gws auth status

# Switch
gws auth logout
gws auth login  # authenticate with different account
```

For team members with multiple Google accounts, always verify you're using the BinPar account before running commands.

## Credential Security

- Credentials are encrypted with **AES-256-GCM**
- Stored in the **OS keyring** (macOS Keychain, Linux Secret Service, Windows Credential Vault)
- OAuth tokens are scoped to the specific APIs enabled
- Refresh tokens auto-renew access tokens
- No credentials are stored in plaintext on disk

## Required API Scopes

The following scopes are requested during authentication:

| Scope | Purpose |
|-------|---------|
| `https://www.googleapis.com/auth/documents` | Read and write Google Docs |
| `https://www.googleapis.com/auth/drive` | Access Google Drive files and folders |
| `https://www.googleapis.com/auth/spreadsheets` | Read and write Google Sheets |

## Troubleshooting

### "gws: command not found"
- Verify installation: `npm list -g @googleworkspace/cli`
- Check PATH includes npm global bin: `npm bin -g`
- Try reinstalling: `npm install -g @googleworkspace/cli`

### "Node.js version too old"
- Check version: `node --version`
- Upgrade: `brew install node` or download from [nodejs.org](https://nodejs.org)

### Authentication fails in browser
- Clear browser cookies for accounts.google.com
- Try incognito/private window
- Ensure you're selecting the BinPar account, not personal

### "API not enabled" errors
- Go to [Google Cloud Console](https://console.cloud.google.com/apis/library)
- Select your project
- Search for and enable the missing API

### "Insufficient permissions" on Drive files
- The file must be shared with your account
- For organization-wide templates, check with your Google Workspace admin
- Verify you authenticated with the correct account: `gws auth status`

### OAuth consent screen issues
- For BinPar (Google Workspace organization): consent screen should be "Internal"
- Internal apps don't need Google review
- If set to "External", it may be in "Testing" mode with user limits

### Corporate firewall / proxy
- Allowlist these domains:
  - `accounts.google.com`
  - `oauth2.googleapis.com`
  - `www.googleapis.com`
  - `docs.googleapis.com`
  - `sheets.googleapis.com`
- If behind a proxy, set `HTTPS_PROXY` environment variable

### Token refresh failures
- Tokens expire after ~1 hour but auto-refresh
- If refresh fails: `gws auth logout && gws auth login`
- If persistent, re-run `gws auth setup` to generate new credentials

## Team Onboarding

For onboarding new BinPar team members:

1. Ensure they have a BinPar Google Workspace account
2. Have them clone the skills repo and symlink skills
3. Run `gws auth setup` — they'll need to:
   - Use the shared GCP project (ask team lead for project name)
   - Or create their own project (APIs will need to be enabled)
4. Verify with `gws drive files list --params '{"pageSize": 1}'`
5. Test document generation with a sample document
