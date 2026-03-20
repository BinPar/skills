---
name: email-sender
description: >
  Use this skill when the user asks to send an email, compose a message,
  draft an email, reply to an email, forward a message, or any email-related
  task via Gmail. Triggers on: "send email", "envía un email", "manda un correo",
  "reply to", "responde a", "forward", "reenvía", "draft", "borrador",
  "escribe un email", "compose", "email to", "correo a", "mail a".
  Default language: matches user's conversation language.
  IMPORTANT: Always verify the complete email with the user before sending.
  IMPORTANT: For decisions or confirmations, use AskQuestionTool or the current
  runtime's equivalent structured question/input mechanism when available,
  preferring option-based prompts over free-text questions whenever possible.
---

# Email Sender

## Runtime Compatibility

This skill supports Claude Code and Codex as equal targets.

- For decisions or confirmations, use AskQuestionTool or the runtime's equivalent structured input flow when available.
- Prefer option-based prompts over free-text questions whenever possible.
- If no structured question tool is available, ask directly in chat.
- Always require explicit final confirmation before creating a draft or sending a message.

Compose and send emails via Gmail API using the `gws` CLI. Supports new emails, replies, reply-all, and forwards with attachments, signatures, and HTML formatting.

**Reference files** (read as needed during execution):
- `references/gws-gmail-commands.md` — All Gmail CLI commands with examples
- `references/mime-construction.md` — Python MIME message construction patterns
- `references/contact-resolution.md` — Name-to-email resolution strategy chain

---

## Step 0: Prerequisites

### 0.1 Verify gws is installed and authenticated

```bash
CI=true gws gmail users messages list --params '{"userId":"me","maxResults":1}'
```

- If `gws` command not found → delegate to `binpar-setup` skill to install and configure
- If 401 Unauthorized → run `CI=true gws gmail auth login` and **show the auth URL in the chat text** (not just in tool output)
- If successful → proceed

### 0.2 Check Directory API scope (optional but recommended)

```bash
CI=true gws people people searchDirectoryPeople \
  --params '{"query":"test","readMask":"names,emailAddresses","sources":"DIRECTORY_SOURCE_TYPE_DOMAIN_PROFILE"}'
```

- If 403 → inform the user that directory-based contact resolution is unavailable. Offer to re-authenticate with expanded scopes via `binpar-setup` (show auth URLs in chat text). If the user declines, proceed without directory — Gmail history and manual input will be used instead.
- If successful → directory search is available

---

## Step 1: Analyze Intent

Parse the user's request to extract:

| Field | How to infer | If not inferable |
|---|---|---|
| **Action type** | New / Reply / Reply-all / Forward | Use AskQuestionTool or equivalent; direct chat only if needed |
| **Recipient(s)** | Names or emails mentioned | Use AskQuestionTool or equivalent; direct chat only if needed |
| **Subject** | Topic from conversation | Use AskQuestionTool or equivalent; direct chat only if needed |
| **Tone** | Formal / semiformal / informal / urgent | Infer from context; if ambiguous → use AskQuestionTool or equivalent |
| **Language** | User's conversation language | Infer; if ambiguous → use AskQuestionTool or equivalent |
| **Attachments** | Referenced files | If paths ambiguous → use AskQuestionTool or equivalent |
| **Key content** | Points to communicate | If insufficient → use AskQuestionTool or equivalent |

**Rule**: NEVER assume critical data (recipient, subject). If ambiguous, ask.

---

## Step 2: Resolve Recipients

For each mentioned recipient, follow the resolution chain from `references/contact-resolution.md`:

1. **Direct email** — if the user provided a full email address (contains `@`), use it directly
2. **Directory API** — search by name (if scope available). Always confirm matches with AskQuestionTool or equivalent when possible
3. **Gmail history** — search sent/received emails for matching names. Confirm with AskQuestionTool or equivalent when possible
4. **Ask directly** — only if no structured question flow is available: "No encontre el email de [name]. Cual es?"

**Important**: Always confirm resolved emails with the user before proceeding. Never send to an unconfirmed address.

---

## Step 3: Identity & Signature

```bash
CI=true gws gmail users settings sendAs list --params '{"userId":"me"}'
```

- **1 sendAs alias** → use it automatically (extract `sendAsEmail`, `displayName`, `signature`)
- **Multiple aliases** → use AskQuestionTool or equivalent to ask which address to send from, showing each alias and its displayName
- Extract `signature` (HTML) from the selected alias
- Extract `displayName` for the `From` header
- If `displayName` is empty → try to extract it from the signature HTML or Gmail profile

---

## Step 4: Generate Content

### 4.1 Determine HTML format level

| Signal | Format |
|---|---|
| Short email (<5 lines), informal tone | Minimal HTML: `<br>` for line breaks, `<a>` for links |
| Medium email, semiformal tone | Minimal + `<b>` and `<i>` where content needs it |
| Long email, formal tone, structured data | Rich HTML: bold, lists `<ul>/<ol>`, tables `<table>`, headers `<h3>` |
| Reply | Same level as original email or simpler |

### 4.2 Compose the body

- Appropriate greeting for the tone (Hola / Estimado/a / Buenos días...)
- Body with the user's key points
- Appropriate closing for the tone (Un saludo, / Saludos cordiales, / Atentamente,)
- **Do NOT** add the sender's name before the signature — the signature already contains the full name, title, and contact info. Adding it again is redundant.
- **Do NOT** include the HTML signature in the body — it gets concatenated separately

### 4.3 Assemble full HTML

```html
<div dir="ltr">
  [email body in HTML]
  <br>
  <div class="gmail_signature">
    [signature HTML from sendAs]
  </div>
</div>
```

See `references/mime-construction.md` for detailed HTML templates (minimal vs. rich).

---

## Step 5: Handle Attachments

If the user references files:

1. **Verify existence**: `ls -la "<path>"`
2. **Check for conversions needed**:
   - SVG → PNG: use `qlmanage -t -s 2000 -o /tmp "<path>"` (macOS built-in)
   - Other formats: evaluate case by case
3. **Validate size**: Gmail limit is 25MB total, recommend <10MB
4. **If oversized** → use AskQuestionTool or equivalent to ask: "El adjunto pesa X MB. Enviarlo igualmente, comprimirlo, o subirlo a Drive y compartir link?"

---

## Step 6: Build MIME Message

Use Python to construct the RFC 2822 message. See `references/mime-construction.md` for complete code patterns.

**Critical rules**:
- ALWAYS use `formataddr((name, email))` for From/To/Cc/Bcc headers
- ALWAYS set the `From` header explicitly
- UTF-8 encoding is handled by Python's `email` library automatically
- Save the message as `.eml` file in the current working directory (gws `--upload` requires this)

```python
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from email.utils import formataddr
import base64, os, mimetypes

msg = MIMEMultipart('mixed')
msg['From'] = formataddr((display_name, send_as_email))
msg['To'] = formataddr((recipient_name, recipient_email))
msg['Subject'] = subject

# HTML body with signature
html_part = MIMEText(html_body, 'html', 'utf-8')
msg.attach(html_part)

# Attachments (if any)
for filepath in attachments:
    filename = os.path.basename(filepath)
    ctype, _ = mimetypes.guess_type(filepath)
    if ctype is None:
        ctype = 'application/octet-stream'
    maintype, subtype = ctype.split('/', 1)
    with open(filepath, 'rb') as f:
        part = MIMEBase(maintype, subtype)
        part.set_payload(f.read())
    encoders.encode_base64(part)
    part.add_header('Content-Disposition', 'attachment', filename=filename)
    msg.attach(part)

# Save to file
with open('./email_to_send.eml', 'wb') as f:
    f.write(msg.as_bytes())
```

---

## Step 7: Preview & Send

### 7.1 Show preview in chat

Display a formatted markdown summary to the user:

```
**De:** Alberto Blanco <ablanco@binpar.com>
**Para:** Cristian <cristian@binpar.com>
**CC:** (if applicable)
**Asunto:** Organización BinPar 2026

---

Hola Cristian,

[email body as plain text for preview]

Un saludo,

[Firma: ✓ incluida]
[Adjuntos: filename.png (1.8 MB)]
```

### 7.2 Ask for action

Ask the user for the next action using AskQuestionTool or the current runtime's equivalent structured input flow when available, otherwise ask directly in chat:
1. **Enviar ahora** — send directly via `messages.send`
2. **Crear borrador en Gmail** — create draft, provide URL for final review
3. **Editar** — user says what to change, regenerate and ask again

### 7.3 If user chooses "Draft"

```bash
# Generate the .eml file (Step 6)
CI=true gws gmail users drafts create \
  --params '{"userId":"me"}' \
  --upload ./draft_email.eml \
  --upload-content-type "message/rfc822"
```

Show the user: "Borrador creado. Puedes revisarlo en Gmail."

Extract the `draft.id` from the response. If the user later confirms sending:

```bash
CI=true gws gmail users drafts send \
  --params '{"userId":"me"}' \
  --json '{"id":"<draftId>"}'
```

### 7.4 If user chooses "Send"

```bash
# Generate the .eml file (Step 6)
CI=true gws gmail users messages send \
  --params '{"userId":"me"}' \
  --upload ./email_to_send.eml \
  --upload-content-type "message/rfc822"
```

### 7.5 Cleanup

Delete temporary `.eml` files after successful send or draft creation:

```bash
rm -f ./email_to_send.eml ./draft_email.eml ./reply_email.eml
```

---

## Step 8: Reply / Reply-all / Forward

### 8.1 Locate the original message

The user may reference an email by:
- **Subject or content** → search with `messages.list` + `q` parameter
- **Message ID** → use directly
- **Conversation context** → if an email was discussed earlier in the chat

```bash
CI=true gws gmail users messages list \
  --params '{"userId":"me","q":"subject:<search>","maxResults":5}'

CI=true gws gmail users messages get \
  --params '{"userId":"me","id":"<msgId>","format":"full"}'
```

If the search returns multiple results, show them to the user and ask them to select the correct one.

### 8.2 Extract data from the original

From the original message, extract:
- `Message-ID` header → for `In-Reply-To` and `References`
- `From` / `To` / `Cc` → for determining reply recipients
- `Subject` → prefix with `Re:` (reply) or `Fwd:` (forward)
- `threadId` → to keep the Gmail thread together
- Body HTML → for quoted text

### 8.3 Determine recipients

- **Reply**: To = From of the original
- **Reply-all**: To = From of the original, Cc = all To/Cc of the original (excluding the user's own address)
- **Forward**: To = new recipient specified by the user

### 8.4 Build reply MIME

Add threading headers:

```python
msg['In-Reply-To'] = original_message_id
msg['References'] = f"{original_references} {original_message_id}".strip()

if not subject.lower().startswith('re:'):
    msg['Subject'] = f"Re: {subject}"
```

Include quoted text in the HTML body:

```html
<div dir="ltr">
  [new reply content]
  <br>
  <div class="gmail_signature">[signature]</div>
  <br>
  <div class="gmail_quote">
    <div class="gmail_attr">El [date], [name] &lt;[email]&gt; escribió:</div>
    <blockquote style="margin:0 0 0 .8ex;border-left:1px #ccc solid;padding-left:1ex">
      [original body HTML]
    </blockquote>
  </div>
</div>
```

### 8.5 Send reply with threadId

```bash
CI=true gws gmail users messages send \
  --params '{"userId":"me"}' \
  --upload ./reply_email.eml \
  --upload-content-type "message/rfc822" \
  --json '{"threadId":"<threadId>"}'
```

---

## Error Handling

| Error | Cause | Action |
|---|---|---|
| `gws` not found | CLI not installed | Delegate to `binpar-setup` skill |
| 401 Unauthorized | Token expired | Run `CI=true gws gmail auth login`, show URL in chat |
| 403 Insufficient scopes | Missing scope | Inform user + offer re-auth via `binpar-setup` |
| `--upload` path error | .eml file outside working dir | Save .eml in current working directory |
| Attachment >25MB | Gmail limit | Ask whether to compress, upload to Drive, or cancel |
| `argument list too long` | Raw JSON too large | Use `--upload` with .eml file instead of `--json` inline |
| Empty display name in From | `formataddr()` not used | Always use `formataddr((name, email))` |
| Subject encoding issues | UTF-8 characters | Python `email` lib handles encoding automatically |
