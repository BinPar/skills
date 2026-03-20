# Contact Resolution

Strategy chain for resolving names to email addresses, in priority order.

---

## Step 1: Direct Email

If the user provides a full email address (contains `@`), use it directly.

Optionally resolve the display name via Directory API or Gmail history for a friendlier `From`/`To` header.

---

## Step 2: Directory API

**Requires scope**: `https://www.googleapis.com/auth/directory.readonly`

```bash
CI=true gws people people searchDirectoryPeople \
  --params '{"query":"<name>","readMask":"names,emailAddresses","sources":"DIRECTORY_SOURCE_TYPE_DOMAIN_PROFILE"}'
```

### Verification command

```bash
CI=true gws people people searchDirectoryPeople \
  --params '{"query":"test","readMask":"names,emailAddresses","sources":"DIRECTORY_SOURCE_TYPE_DOMAIN_PROFILE"}'
```

### Result handling

| Result | Action |
|---|---|
| 1 match | AskUserQuestion to confirm: "Is it [Name] ([email])?" |
| N matches | AskUserQuestion with numbered options |
| 0 matches | Fall through to Step 3 |
| 403 error | Directory scope not available — inform user, fall through to Step 3 |

### If 403 (scope not available)

Inform the user that directory search requires expanded scopes and offer to re-authenticate via `binpar-setup`. Do NOT silently skip — the user should know why name resolution is limited.

---

## Step 3: Gmail History Search

Search the user's sent/received emails for matching names.

```bash
# Search in sent emails
CI=true gws gmail users messages list \
  --params '{"userId":"me","q":"to:<name>","maxResults":5}'

# Search in received emails (if sent search yields nothing)
CI=true gws gmail users messages list \
  --params '{"userId":"me","q":"from:<name>","maxResults":5}'
```

For each result, extract the email address:

```bash
CI=true gws gmail users messages get \
  --params '{"userId":"me","id":"<messageId>","format":"metadata","metadataHeaders":["To","Cc","From"]}'
```

### Processing

1. Extract email addresses from matching headers
2. Deduplicate
3. Rank by frequency (most common match first)
4. AskUserQuestion with the options found
5. If 0 results → fall through to Step 4

---

## Step 4: Ask the User

If all automated methods fail:

```
AskUserQuestion: "No encontré el email de <name>. ¿Cuál es su dirección de correo?"
```

---

## Multiple Recipients

Apply the resolution chain independently for each recipient. Batch the confirmations when possible — e.g., if resolving 3 names via Directory API, present all 3 confirmations together instead of one at a time.

---

## Display Name Extraction

When you have an email but need the display name:

1. Check Directory API response `names` field
2. Check Gmail message headers (From header often includes display name)
3. Parse from email prefix (e.g., `cristian.garcia` → `Cristian Garcia`) as last resort
4. Use the email address itself if no name is available
