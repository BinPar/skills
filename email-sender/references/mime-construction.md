# MIME Message Construction

Python reference for building RFC 2822 compliant email messages for Gmail API.

---

## Basic Email (HTML body, no attachments)

```python
import base64
from email.mime.text import MIMEText
from email.utils import formataddr

html_body = """<div dir="ltr">
  <p>Hola Cristian,</p>
  <p>Contenido del email aquí.</p>
  <p>Un saludo,</p>
  <br>
  <div class="gmail_signature">
    <!-- signature HTML from sendAs (already includes name, title, contact) -->
  </div>
</div>"""

msg = MIMEText(html_body, 'html', 'utf-8')
msg['From'] = formataddr(('Alberto Blanco', 'ablanco@binpar.com'))
msg['To'] = formataddr(('Cristian', 'cristian@binpar.com'))
msg['Subject'] = 'Asunto del email'

raw = base64.urlsafe_b64encode(msg.as_bytes()).decode()
```

---

## Email with Attachments (multipart/mixed)

```python
import base64
import mimetypes
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from email.utils import formataddr

msg = MIMEMultipart('mixed')
msg['From'] = formataddr((display_name, send_as_email))
msg['To'] = formataddr((recipient_name, recipient_email))
msg['Subject'] = subject

# If multiple recipients:
# msg['To'] = ', '.join([formataddr((n, e)) for n, e in to_list])
# msg['Cc'] = ', '.join([formataddr((n, e)) for n, e in cc_list])
# msg['Bcc'] = ', '.join([formataddr((n, e)) for n, e in bcc_list])

# HTML body (includes signature)
html_part = MIMEText(html_body, 'html', 'utf-8')
msg.attach(html_part)

# Attachments
for filepath in attachment_paths:
    filename = os.path.basename(filepath)
    content_type, _ = mimetypes.guess_type(filepath)
    if content_type is None:
        content_type = 'application/octet-stream'
    main_type, sub_type = content_type.split('/', 1)

    with open(filepath, 'rb') as f:
        part = MIMEBase(main_type, sub_type)
        part.set_payload(f.read())
    encoders.encode_base64(part)
    part.add_header('Content-Disposition', 'attachment', filename=filename)
    msg.attach(part)

raw = base64.urlsafe_b64encode(msg.as_bytes()).decode()
```

---

## Email with Inline Body Images (multipart/related)

Use this when charts, diagrams, or explanatory visuals should appear inside the message body instead of as normal visible attachments.

```python
import os
from email.mime.image import MIMEImage
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formataddr

msg_root = MIMEMultipart('related')
msg_root['From'] = formataddr((display_name, send_as_email))
msg_root['To'] = formataddr((recipient_name, recipient_email))
msg_root['Subject'] = subject

alt = MIMEMultipart('alternative')
alt.attach(MIMEText(plain_body, 'plain', 'utf-8'))
alt.attach(MIMEText(html_body, 'html', 'utf-8'))
msg_root.attach(alt)

with open('./chart.png', 'rb') as f:
    img = MIMEImage(f.read(), _subtype='png')
img.add_header('Content-ID', '<chart>')
img.add_header('Content-Disposition', 'attachment', filename='chart.png')
img.add_header('X-Attachment-Id', '')
msg_root.attach(img)
```

Use the image in HTML like this:

```html
<p style="text-align:center">
  <img src="cid:chart" alt="Chart description" width="600"
       style="max-width:100%;height:auto;border-radius:8px">
</p>
```

**Why this pattern:** Gmail reliably renders this shape for inline visuals while still preserving the image part as an attachment-backed MIME node.

---

## Email with Inline Images and Regular Attachments

If the email needs both inline body visuals and ordinary attachments, nest the MIME structure:

```python
from email.mime.base import MIMEBase
from email.mime.image import MIMEImage
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email import encoders

msg = MIMEMultipart('mixed')
msg['From'] = formataddr((display_name, send_as_email))
msg['To'] = formataddr((recipient_name, recipient_email))
msg['Subject'] = subject

related = MIMEMultipart('related')
alt = MIMEMultipart('alternative')
alt.attach(MIMEText(plain_body, 'plain', 'utf-8'))
alt.attach(MIMEText(html_body, 'html', 'utf-8'))
related.attach(alt)

with open('./diagram.png', 'rb') as f:
    inline_img = MIMEImage(f.read(), _subtype='png')
inline_img.add_header('Content-ID', '<diagram>')
inline_img.add_header('Content-Disposition', 'attachment', filename='diagram.png')
inline_img.add_header('X-Attachment-Id', '')
related.attach(inline_img)

msg.attach(related)

with open('./report.pdf', 'rb') as f:
    part = MIMEBase('application', 'pdf')
    part.set_payload(f.read())
encoders.encode_base64(part)
part.add_header('Content-Disposition', 'attachment', filename='report.pdf')
msg.attach(part)
```

---

## Reply / Forward Headers

For replies, add these headers to maintain the thread:

```python
# Extract from the original message:
# - Message-ID header → original_message_id
# - References header → original_references
# - threadId → for the gws send command

msg['In-Reply-To'] = original_message_id
msg['References'] = f"{original_references} {original_message_id}".strip()

# Subject: prepend Re: or Fwd: if not already present
if not subject.lower().startswith('re:'):
    msg['Subject'] = f"Re: {subject}"
```

---

## Reply with Quoted Text

Structure for a reply that includes the original message:

```python
html_body = f"""<div dir="ltr">
  {new_reply_html}
  <br>
  <div class="gmail_signature">
    {signature_html}
  </div>
  <br>
  <div class="gmail_quote">
    <div class="gmail_attr">El {original_date}, {original_sender_name} &lt;{original_sender_email}&gt; escribió:</div>
    <blockquote style="margin:0 0 0 .8ex;border-left:1px #ccc solid;padding-left:1ex">
      {original_body_html}
    </blockquote>
  </div>
</div>"""
```

---

## HTML Body Structure

### Minimal (informal/short emails)

```html
<div dir="ltr">
  Hola Cristian,<br>
  <br>
  El contenido va aquí.<br>
  <br>
  Un saludo,<br>
  <br>
  <div class="gmail_signature">
    <!-- signature already includes name, title, contact info -->
  </div>
</div>
```

### Rich (formal/long emails)

```html
<div dir="ltr">
  <p>Estimado Cristian,</p>
  <p>Párrafo introductorio.</p>
  <h3>Sección</h3>
  <ul>
    <li>Punto 1</li>
    <li>Punto 2</li>
  </ul>
  <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse">
    <tr><th>Col 1</th><th>Col 2</th></tr>
    <tr><td>Data</td><td>Data</td></tr>
  </table>
  <p>Atentamente,</p>
  <br>
  <div class="gmail_signature">
    <!-- signature already includes name, title, contact info -->
  </div>
</div>
```

### Structured Executive Email

Use this for internal summaries, executive updates, or any email that should feel polished without becoming a newsletter.

```html
<div dir="ltr">
  <p>Hola Cristian,</p>

  <p>Resumen breve del objetivo del correo.</p>

  <hr style="border:none;border-top:2px solid #ff9900;margin:25px 0">

  <h2 style="color:#211253;font-size:20px">1. Primera sección</h2>
  <p>Texto de contexto.</p>
  <ul>
    <li>Punto 1</li>
    <li>Punto 2</li>
  </ul>

  <hr style="border:none;border-top:1px solid #ddd;margin:25px 0">

  <h2 style="color:#211253;font-size:20px">2. Segunda sección</h2>
  <h3 style="color:#6446b4;font-size:16px">Subsección</h3>
  <p>Más detalle.</p>

  <p style="text-align:center">
    <img src="cid:visual" alt="Descripcion breve" width="600"
         style="max-width:100%;height:auto;border-radius:8px">
  </p>

  <p>Un saludo,</p>
  <br>
  <div class="gmail_signature">
    <!-- signature already includes name, title, contact info -->
  </div>
</div>
```

**Default rule:** This is usually the right pattern for "maquetalo bien" unless the user explicitly asks for a more designed marketing-style email.

---

## Saving to .eml File

```python
# Save the complete MIME message to a file for upload via gws
eml_path = './email_to_send.eml'
with open(eml_path, 'wb') as f:
    f.write(msg.as_bytes())
```

**Important**: The `.eml` file MUST be saved in the current working directory because `gws --upload` requires files within the working directory.

---

## Critical Rules

1. **ALWAYS use `formataddr()`** for From, To, Cc, Bcc headers — never concatenate strings manually
2. **ALWAYS set the `From` header explicitly** — don't rely on Gmail to set it
3. **UTF-8 encoding** is handled automatically by Python's `email` library for Subject and body
4. **Signature HTML** goes inside `<div class="gmail_signature">` — never inline it in the body text
5. **Clean up `.eml` files** after successful send/draft creation
6. **File size limit**: Gmail allows up to 25MB total, recommend staying under 10MB
7. **Prefer simple HTML structure** for executive/internal emails — avoid overdesign by default
8. **Use `width="600"` plus `max-width:100%`** for inline visuals unless the user asks otherwise
9. **Do not use preview thumbnails as final assets** — export full-size PNGs for email visuals
10. **Check embedded visuals before drafting/sending** if they contain text or tight layouts
