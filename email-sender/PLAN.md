# Plan: Email Sender Skill

## Resumen

Skill para componer y enviar emails desde Claude Code o Codex vía Gmail API (gws CLI). Sigue el patrón de `doc-generator`: un `SKILL.md` con instrucciones en Markdown y archivos de referencia compartidos.

## Decisiones de diseño

| Decisión | Resolución |
|---|---|
| Resolución de contactos | Directory API → Gmail history → preguntar al usuario |
| Formato HTML | Adaptativo: mínimo (informal/corto) vs. rico (formal/largo) |
| Verificación pre-envío | Preview en chat + AskQuestionTool o equivalente del runtime (borrador Gmail / enviar) |
| Hilos | Emails nuevos + reply/reply-all/forward |
| Identidad | Siempre la real del sendAs. No se permite override de nombre |
| Firma | Se usa la del usuario. Si tiene varias sendAs, preguntar cuál |
| Scopes | Ampliar con Directory API vía binpar-setup si no están disponibles |

## Estructura de archivos

```
email-sender/
├── SKILL.md                          # Definición + implementación completa
└── references/
    ├── gws-gmail-commands.md         # Referencia de comandos Gmail vía gws
    ├── mime-construction.md          # Guía de construcción de mensajes MIME
    └── contact-resolution.md         # Estrategias de resolución de contactos
```

---

## Workflow de la skill (pasos del SKILL.md)

### Paso 0: Prerequisitos

- Verificar que `gws` está instalado y autenticado (`CI=true gws gmail users messages list --params '{"userId":"me","maxResults":1}'`)
- Si falla → delegar a la skill `binpar-setup` para instalar/autenticar
- Verificar scope de Directory API (`CI=true gws people people searchDirectoryPeople --params '{"query":"test","readMask":"names,emailAddresses","sources":"DIRECTORY_SOURCE_TYPE_DOMAIN_PROFILE"}'`)
- Si 403 → informar al usuario que la resolución de contactos por directorio no está disponible y que necesita re-autenticar con scopes ampliados. Delegar a `binpar-setup` siguiendo sus instrucciones para mostrar URLs de auth correctamente (en texto del chat, no solo en output de herramienta)

### Paso 1: Análisis de intención

Parsear la petición del usuario para extraer:

| Campo | Inferencia | Si no se infiere |
|---|---|---|
| **Tipo de acción** | Nuevo / Reply / Reply-all / Forward | AskQuestionTool o equivalente |
| **Destinatario(s)** | Nombres o emails mencionados | AskQuestionTool o equivalente |
| **Asunto** | Tema de la conversación | AskQuestionTool o equivalente |
| **Tono** | Formal / semiformal / informal / urgente | Inferir del contexto, si ambiguo → AskQuestionTool o equivalente |
| **Idioma** | Idioma del usuario en la conversación | Inferir, si ambiguo → AskQuestionTool o equivalente |
| **Adjuntos** | Archivos referenciados | Si paths ambiguos → AskQuestionTool o equivalente |
| **Contenido clave** | Puntos a comunicar | Si insuficiente → AskQuestionTool o equivalente |

**Regla**: la skill NUNCA asume datos críticos (destinatario, asunto). Si hay ambigüedad, pregunta.

### Paso 2: Resolución de destinatarios

Para cada destinatario mencionado:

```
Si es email completo (contiene @):
  → Usar directamente
  → Intentar resolver display name vía Directory API o Gmail history

Si es solo un nombre:
  1. Directory API (si scopes disponibles):
     CI=true gws people people searchDirectoryPeople \
       --params '{"query":"<nombre>","readMask":"names,emailAddresses","sources":"DIRECTORY_SOURCE_TYPE_DOMAIN_PROFILE"}'
     → Si 1 resultado → AskQuestionTool o equivalente para confirmar: "¿<nombre> (<email>)?"
     → Si N resultados → AskQuestionTool o equivalente con opciones
     → Si 0 resultados → paso 2

  2. Gmail history search:
     CI=true gws gmail users messages list \
       --params '{"userId":"me","q":"to:<nombre>","maxResults":5}'
     → Para cada message, extraer header To con:
       CI=true gws gmail users messages get \
         --params '{"userId":"me","id":"<msgId>","format":"metadata","metadataHeaders":"To,Cc"}'
     → Deduplicar emails encontrados
     → AskQuestionTool o equivalente con las opciones encontradas
     → Si 0 resultados → paso 3

  3. Pedir email directamente:
     AskQuestionTool o equivalente si es posible; si no, preguntar: "No encontré el email de <nombre>. ¿Cuál es?"
```

### Paso 3: Identidad y firma

```bash
# Obtener aliases y firmas
CI=true gws gmail users settings sendAs list --params '{"userId":"me"}'
```

- Si **1 sendAs** → usar automáticamente (email + displayName + signature HTML)
- Si **N sendAs** → AskQuestionTool o equivalente: "¿Desde qué dirección quieres enviar?"
  - Mostrar cada alias con su displayName
- Extraer `signature` (HTML) del alias seleccionado
- Extraer `displayName` para el header `From`
- Si `displayName` está vacío → extraerlo del signature HTML o del perfil de Gmail

### Paso 4: Generación de contenido

#### 4.1 Determinar nivel de formato HTML

| Señal | Formato |
|---|---|
| Email corto (<5 líneas), tono informal | HTML mínimo: `<br>` para saltos, `<a>` para links |
| Email medio, tono semiformal | HTML mínimo + `<b>` y `<i>` si el contenido lo pide |
| Email largo, tono formal, con datos estructurados | HTML rico: negritas, listas `<ul>/<ol>`, tablas `<table>`, headers `<h3>` |
| Reply | Mismo nivel que el email original o inferior |

#### 4.2 Generar el cuerpo

- Componer el saludo apropiado al tono (Hola / Estimado/a / Buenos días...)
- Redactar el contenido con los puntos clave del usuario
- Cierre apropiado al tono (Un saludo / Saludos cordiales / Atentamente...)
- El nombre de cierre es SIEMPRE el `displayName` del sendAs seleccionado
- **NO** incluir la firma HTML en el cuerpo — se concatena después

#### 4.3 Ensamblar HTML completo

```html
<div dir="ltr">
  [cuerpo del email en HTML]
  <br>
  <div class="gmail_signature">
    [signature HTML del sendAs]
  </div>
</div>
```

### Paso 5: Manejo de adjuntos

Si el usuario referencia archivos:

1. Verificar que existen (`ls -la "<path>"`)
2. Detectar si necesitan conversión:
   - SVG → PNG: usar `qlmanage -t -s 2000` (macOS built-in)
   - Otros formatos: evaluar caso a caso
3. Validar tamaño (Gmail límite: 25MB total, recomendar <10MB)
4. Si el tamaño excede → AskQuestionTool o equivalente: "El adjunto pesa X MB. ¿Enviarlo igualmente, comprimirlo, o subirlo a Drive y compartir link?"

### Paso 6: Construcción MIME

Usar Python para construir el mensaje RFC 2822:

```python
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email.utils import formataddr
import base64

msg = MIMEMultipart('mixed')
msg['From'] = formataddr((display_name, send_as_email))
msg['To'] = formataddr((recipient_name, recipient_email))
msg['Subject'] = subject

# Para replies:
# msg['In-Reply-To'] = original_message_id
# msg['References'] = original_references + ' ' + original_message_id

# Cuerpo HTML (incluye firma)
html_part = MIMEText(html_body, 'html', 'utf-8')
msg.attach(html_part)

# Adjuntos
for attachment in attachments:
    part = MIMEBase(main_type, sub_type)
    part.set_payload(file_bytes)
    encoders.encode_base64(part)
    part.add_header('Content-Disposition', 'attachment', filename=filename)
    msg.attach(part)

raw = base64.urlsafe_b64encode(msg.as_bytes()).decode()
```

**Puntos críticos** (lecciones del error anterior):
- SIEMPRE usar `formataddr()` para incluir display names en From/To/Cc/Bcc
- SIEMPRE setear el header `From` explícitamente
- Codificar el Subject correctamente (email.header maneja UTF-8 automáticamente)

### Paso 7: Preview y verificación

#### 7.1 Mostrar preview en chat

Mostrar al usuario un resumen formateado en markdown:

```
**De:** Alberto Blanco <ablanco@binpar.com>
**Para:** Cristian <cristian@binpar.com>
**CC:** (si aplica)
**Asunto:** Organización BinPar 2026

---

Hola Cristian,

[cuerpo del email en texto plano para preview]

Un saludo,
Alberto Blanco

[Firma: ✓ incluida]
[Adjuntos: Organizacion BinPar 2026.png (1.8 MB)]
```

#### 7.2 Preguntar acción

Preguntar con opciones usando AskQuestionTool o el equivalente estructurado del runtime si está disponible, o chat directo si no:
1. **Enviar ahora** — envía directamente vía `messages.send`
2. **Crear borrador en Gmail** — crea draft, muestra URL para revisión final en Gmail
3. **Editar** — el usuario indica qué cambiar, se regenera y se vuelve a preguntar

#### 7.3 Si elige borrador

```bash
# Guardar MIME como archivo en el directorio de trabajo
# (gws --upload requiere que el archivo esté dentro del directorio actual)
python3 -c "[generar y guardar MIME a ./draft_email.eml]"

CI=true gws gmail users drafts create \
  --params '{"userId":"me"}' \
  --upload ./draft_email.eml \
  --upload-content-type "message/rfc822"
```

Mostrar al usuario: "Borrador creado. Revísalo en Gmail y dime si quiero enviarlo."

Tras confirmación:
```bash
CI=true gws gmail users drafts send \
  --params '{"userId":"me"}' \
  --json '{"id":"<draft_id>"}'
```

#### 7.4 Si elige enviar

```bash
python3 -c "[generar y guardar MIME a ./send_email.eml]"

CI=true gws gmail users messages send \
  --params '{"userId":"me"}' \
  --upload ./send_email.eml \
  --upload-content-type "message/rfc822"
```

#### 7.5 Limpieza

Eliminar archivos temporales `.eml` tras envío exitoso.

### Paso 8: Reply / Reply-all / Forward

#### 8.1 Localizar el mensaje original

El usuario puede referenciar un email por:
- **Asunto o contenido** → buscar con `messages.list` + `q` parameter
- **ID de mensaje** → si lo proporciona directamente
- **Contexto de la conversación** → si se habló de un email antes en el chat

```bash
# Buscar por asunto/contenido
CI=true gws gmail users messages list \
  --params '{"userId":"me","q":"subject:<busqueda>","maxResults":5}'

# Obtener mensaje completo
CI=true gws gmail users messages get \
  --params '{"userId":"me","id":"<msgId>","format":"full"}'
```

#### 8.2 Extraer datos del original

Del mensaje original extraer:
- `Message-ID` header → para `In-Reply-To` y `References`
- `From` / `To` / `Cc` → para determinar destinatarios del reply
- `Subject` → prefijo `Re:` (reply) o `Fwd:` (forward)
- `threadId` → para mantener el hilo en Gmail
- Cuerpo → para quoted text

#### 8.3 Construir el reply

- **Reply**: To = From del original
- **Reply-all**: To = From del original, Cc = todos los To/Cc del original (excepto el usuario)
- **Forward**: To = nuevo destinatario indicado por el usuario

Headers adicionales en el MIME:
```
In-Reply-To: <message-id-del-original>
References: <references-del-original> <message-id-del-original>
```

En el JSON de envío, incluir `threadId` para que Gmail agrupe en el mismo hilo:
```bash
CI=true gws gmail users messages send \
  --params '{"userId":"me"}' \
  --upload ./reply_email.eml \
  --upload-content-type "message/rfc822" \
  --json '{"threadId":"<threadId>"}'
```

Incluir el cuerpo del original como quoted text:
```html
<div dir="ltr">
  [respuesta nueva]
  <br>
  <div class="gmail_signature">[firma]</div>
  <br>
  <div class="gmail_quote">
    <div class="gmail_attr">El [fecha], [nombre] &lt;[email]&gt; escribió:</div>
    <blockquote style="margin:0 0 0 .8ex;border-left:1px #ccc solid;padding-left:1ex">
      [cuerpo original HTML]
    </blockquote>
  </div>
</div>
```

---

## Archivos de referencia

### `references/gws-gmail-commands.md`

Documentar todos los comandos de Gmail usados por la skill con ejemplos concretos:

| Operación | Comando | Uso |
|---|---|---|
| Listar mensajes | `gmail users messages list` | Buscar emails por query |
| Obtener mensaje | `gmail users messages get` | Leer headers y cuerpo |
| Enviar mensaje | `gmail users messages send` | Envío directo (upload MIME) |
| Crear borrador | `gmail users drafts create` | Preview en Gmail (upload MIME) |
| Enviar borrador | `gmail users drafts send` | Enviar draft confirmado |
| Obtener hilo | `gmail users threads get` | Context de conversación |
| Listar sendAs | `gmail users settings sendAs list` | Identidades y firmas |
| Buscar directorio | `people people searchDirectoryPeople` | Resolver nombres a emails |

Incluir:
- El prefijo `CI=true` obligatorio en todos los comandos
- La restricción de `--upload` (debe estar dentro del directorio de trabajo)
- Patrones de query de Gmail (`to:`, `from:`, `subject:`, `is:`, `has:attachment`)

### `references/mime-construction.md`

Script Python reutilizable para construir mensajes MIME correctos:

- Uso de `formataddr()` para display names (el error que tuvimos)
- Encoding UTF-8 correcto para Subject con caracteres especiales
- Estructura `multipart/mixed` con HTML + adjuntos
- Estructura `multipart/alternative` con text/plain + text/html (para clientes que no renderizan HTML)
- Concatenación correcta de body + firma HTML
- Headers para replies (`In-Reply-To`, `References`)
- Base64url encoding para la API de Gmail
- Guardar a archivo `.eml` para upload vía gws

### `references/contact-resolution.md`

Documentar la cadena de resolución:

1. **Directory API** (si scopes disponibles):
   - Comando: `people people searchDirectoryPeople`
   - Params: `query`, `readMask=names,emailAddresses`, `sources=DIRECTORY_SOURCE_TYPE_DOMAIN_PROFILE`
   - Requiere scope `https://www.googleapis.com/auth/directory.readonly`
   - Si 403 → informar al usuario, ofrecer re-auth vía `binpar-setup`

2. **Gmail history**:
   - Buscar con `messages.list` + `q=to:<nombre>` o `q=from:<nombre>`
   - Obtener headers `To`, `Cc`, `From` con `messages.get` format `metadata`
   - Deduplicar y rankear por frecuencia
   - Siempre confirmar con el usuario

3. **Pedir al usuario**:
   - Pregunta directa solicitando el email

---

## Tabla de errores

| Error | Causa | Acción |
|---|---|---|
| `gws` no encontrado | CLI no instalado | Delegar a `binpar-setup` |
| 401 Unauthorized | Token expirado | `CI=true gws gmail auth login`, mostrar URL en chat |
| 403 Insufficient scopes | Falta scope | Informar + ofrecer re-auth vía `binpar-setup` |
| `--upload` fuera del directorio | Archivo .eml en /tmp | Copiar al directorio de trabajo antes de upload |
| Adjunto >25MB | Límite de Gmail | Preguntar: comprimir, Drive link, o cancelar |
| `argument list too long` | JSON del raw demasiado grande | Usar `--upload` con archivo .eml en vez de `--json` inline |
| Display name vacío en From | No se seteó `formataddr()` | Siempre usar `formataddr((name, email))` |
| Subject mal codificado | Caracteres UTF-8 | Python `email` lib maneja encoding automáticamente |

---

## Trigger description para el SKILL.md

```yaml
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
  IMPORTANT: For any decision or confirmation, use AskQuestionTool or the runtime's equivalent structured question/input flow when available, preferring option-based prompts whenever possible.
---
```

---

## Orden de implementación

1. **SKILL.md** — Frontmatter + pasos 0-7 (emails nuevos, sin reply)
2. **references/gws-gmail-commands.md** — Comandos base
3. **references/mime-construction.md** — Script MIME con `formataddr`
4. **references/contact-resolution.md** — Cadena de resolución
5. **SKILL.md paso 8** — Añadir reply/forward
6. **Testing manual** — Enviar email nuevo, reply, con adjuntos, con firma
