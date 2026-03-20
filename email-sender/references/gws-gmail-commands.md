# Gmail Commands via gws CLI

Quick reference for all Gmail API operations used by the email-sender skill.

**Important**: ALL commands MUST be prefixed with `CI=true` to suppress interactive prompts.

---

## Authentication & Verification

```bash
# Verify gws is installed and authenticated
CI=true gws gmail users messages list --params '{"userId":"me","maxResults":1}'

# Re-authenticate if token expired
CI=true gws gmail auth login
# IMPORTANT: Show the auth URL in the chat text, not just in tool output
```

---

## Messages

### List Messages

Search for emails using Gmail query syntax.

```bash
CI=true gws gmail users messages list \
  --params '{"userId":"me","q":"<query>","maxResults":5}'
```

**Common query patterns:**
| Query | Description |
|---|---|
| `to:<name or email>` | Emails sent to someone |
| `from:<name or email>` | Emails from someone |
| `subject:<text>` | Emails with subject containing text |
| `is:unread` | Unread emails |
| `has:attachment` | Emails with attachments |
| `newer_than:7d` | Emails from the last 7 days |
| `"exact phrase"` | Exact phrase match |

Queries can be combined: `from:cristian subject:proyecto newer_than:30d`

### Get Message

Retrieve a specific message by ID.

```bash
# Full message (headers + body)
CI=true gws gmail users messages get \
  --params '{"userId":"me","id":"<messageId>","format":"full"}'

# Metadata only (specific headers)
CI=true gws gmail users messages get \
  --params '{"userId":"me","id":"<messageId>","format":"metadata","metadataHeaders":["From","To","Cc","Subject","Message-ID","References","In-Reply-To","Date"]}'

# Raw format (complete RFC 2822)
CI=true gws gmail users messages get \
  --params '{"userId":"me","id":"<messageId>","format":"raw"}'
```

### Send Message

Send a message using an uploaded `.eml` file.

```bash
# IMPORTANT: The .eml file MUST be in the current working directory
# gws --upload requires relative paths within the working directory

python3 -c "[generate and save MIME to ./email_to_send.eml]"

CI=true gws gmail users messages send \
  --params '{"userId":"me"}' \
  --upload ./email_to_send.eml \
  --upload-content-type "message/rfc822"
```

**For replies** (include threadId to keep the conversation thread):

```bash
CI=true gws gmail users messages send \
  --params '{"userId":"me"}' \
  --upload ./reply_email.eml \
  --upload-content-type "message/rfc822" \
  --json '{"threadId":"<threadId>"}'
```

---

## Drafts

### Create Draft

```bash
python3 -c "[generate and save MIME to ./draft_email.eml]"

CI=true gws gmail users drafts create \
  --params '{"userId":"me"}' \
  --upload ./draft_email.eml \
  --upload-content-type "message/rfc822"
```

The response includes a `draft.id` needed for sending.

### Send Draft

```bash
CI=true gws gmail users drafts send \
  --params '{"userId":"me"}' \
  --json '{"id":"<draftId>"}'
```

---

## Threads

### Get Thread

Retrieve all messages in a conversation thread.

```bash
CI=true gws gmail users threads get \
  --params '{"userId":"me","id":"<threadId>","format":"metadata","metadataHeaders":["From","To","Cc","Subject","Date"]}'
```

---

## Settings

### List SendAs Aliases

Get the user's email identities and signatures.

```bash
CI=true gws gmail users settings sendAs list --params '{"userId":"me"}'
```

Response includes for each alias:
- `sendAsEmail` — the email address
- `displayName` — the display name
- `signature` — HTML signature content
- `isDefault` — whether it's the primary alias
- `isPrimary` — whether it's the primary address

---

## People / Directory API

### Search Directory

Resolve names to emails using Google Workspace directory.

```bash
CI=true gws people people searchDirectoryPeople \
  --params '{"query":"<name>","readMask":"names,emailAddresses","sources":"DIRECTORY_SOURCE_TYPE_DOMAIN_PROFILE"}'
```

**Requires scope**: `https://www.googleapis.com/auth/directory.readonly`

If you get a 403, the user needs to re-authenticate with expanded scopes via `binpar-setup`.

---

## Common Pitfalls

| Issue | Solution |
|---|---|
| `--upload` path error | File MUST be in current working directory, use `./filename.eml` |
| `argument list too long` | Use `--upload` with `.eml` file instead of inline `--json` with raw content |
| 401 Unauthorized | Token expired, run `CI=true gws gmail auth login` and show URL in chat |
| 403 Insufficient scopes | Need re-auth via `binpar-setup` with expanded scopes |
| Missing `CI=true` | Commands will hang waiting for interactive input |
