---
name: docs-generator-sermas
description: >
  Use this skill when the user asks for a Sermas, Comunidad de Madrid, Salud
  Digital, or Consejería de Digitalización (DGSD) branded Word / Google Doc —
  i.e. any of the 4 official Sermas document templates: Documento de Petición
  (DPE / alcance funcional), Documento genérico (OP_GEN), Acta de Reunión
  (OP_ACR) or Manual de Usuario (OC_MAN). Triggers on: "DPE sermas",
  "alcance funcional", "acta sermas", "acta de reunión sermas",
  "manual de usuario sermas", "documento genérico sermas", "doc técnico sermas",
  "documento sermas", "comunidad de madrid doc", "OC_DPE", "OP_GEN", "OP_ACR",
  "OC_MAN". Default language: Spanish. Auto-detect intent when the content is
  clearly health-digital / Madrid-regional.
  IMPORTANT: Only emits **Google Docs** (no .docx export). The 4 canon
  templates live in Drive folder "Sermas" and are hardcoded below.
  IMPORTANT: For decisions or confirmations, use AskQuestionTool or the current
  runtime's equivalent structured question/input mechanism when available,
  preferring option-based prompts over free-text questions whenever possible.
---

# Sermas Docs Generator

Paraguas para generar la documentación oficial de Sermas (Comunidad de Madrid — DGSD) sobre Google Docs, a partir de 4 plantillas canon. Detecta el tipo (DPE / GEN / ACR / MAN) por keywords y rutea al flujo correspondiente. Soporta modo **create** (duplica plantilla y rellena) y modo **update** (reescribe secciones de un doc existente y bumpa Hoja de Control).

## Runtime Compatibility

This skill supports Claude Code and Codex as equal targets.

- For user choices, use AskQuestionTool or the current runtime's equivalent structured question/input mechanism when available.
- Prefer option-based prompts over free-text questions whenever possible.
- If no structured question tool is available, ask directly in chat.

**IMPORTANT:** All `gws` commands MUST be prefixed with `CI=true` to disable the TUI and get plain JSON output. Example: `CI=true gws docs documents get ...`

**Reference files** (read as needed during execution):

- `references/dpe-structure.md` — Anatomía del OC_DPE: tablas fijas, placeholders, secciones editables 1-3.
- `references/generico-structure.md` — Anatomía del OP_GEN: portada, hoja de control, índice, cuerpo libre.
- `references/acta-structure.md` — Anatomía del OP_ACR: portada, hoja de control, 3 tablas (asistentes, resoluciones, próximos pasos).
- `references/manual-structure.md` — Anatomía del OC_MAN: 8 secciones fijas + generación multi-perfil.
- `references/gws-docs-commands.md` — Comandos `gws docs` / `gws drive` usados en la skill.
- `references/hoja-control.md` — Patrón para bump de versión y nueva fila en Control de cambios.
- `references/update-flow.md` — Detección de secciones y reescritura acotada en modo update.

## Constants

```
TEMPLATES:
  DPE:  1_X2eU9kKhqMpgyDALeNchTSNHjJJmVnnJcZlGnX1RsI
  GEN:  1C17hlxF4Q8MwvUqA3w8JFHGdYXJ6Gh0YHRERWKzIzAs
  ACR:  1HT5aLb20QT5-FVXtCyeO95rUroWfVvJL43zV1FAsOtI
  MAN:  1lJsr6ur7XJ2cnjaEDpjif3r3UXnc8Ckroj83OYkOkGc

SERMAS_FOLDER_ID: 1UAXTshziOKLW37nBCa_SPhYVWMgcClpd
```

El DPE admite **override** del ID: si el usuario pasa un Google Doc DPE preexistente para ese proyecto (ya con metadata real), se usa ese en lugar del canon.

## Design Principles

1. **Nunca tocar la Hoja de Control completa.** Solo se añade una fila en "Control de cambios" (versión, fecha, motivo, autor) y se bumpa la versión en portada. La tabla "Control de Aprobaciones" y, en el DPE, todas las tablas de metadata (DATOS DE LA PETICIÓN, MOTIVACIÓN, CRITICIDAD, URGENCIA, PRIORIDAD, FASE, DATOS ADMINISTRATIVOS) son responsabilidad del gestor Sermas.
2. **End-to-start.** Todas las operaciones `batchUpdate` que muten texto del body se ordenan **de índice más alto a más bajo** para no invalidar posiciones. Si la lógica es difícil de ordenar, re-leer el doc (`gws docs documents get`) entre batches.
3. **Preserva el `\n`.** `deleteContentRange` nunca incluye el newline terminal de un párrafo: ese `\n` transporta el estilo del heading/párrafo.
4. **Nomenclatura oficial.** El nombre del Google Doc sigue la convención Sermas (ver Step 3).
5. **Entregable = Google Doc.** No se exporta a `.docx`; el usuario exporta manualmente al entregar al cliente.

---

## Step 0: Prerequisites

### 0.1 Verify gws is installed and authenticated

```bash
CI=true gws drive files list --params '{"pageSize": 1}'
```

- If `gws` is not found → tell the user: "Ask me to 'Set up BinPar tools' to install and configure it." Then stop.
- If auth is expired → run `CI=true gws auth login`, extract the URL from the output, and **display it as plain text in the chat** so the user can click it.

---

## Step 1: Detect Intent + Mode

Parse the user's prompt for:

### 1.1 Document type (keyword matrix)

| Type | Keywords (es) |
|------|---------------|
| DPE  | "DPE", "alcance funcional", "documento de petición", "documento de alcance", "OC_DPE" |
| ACR  | "acta", "acta de reunión", "minutas", "OP_ACR" |
| MAN  | "manual de usuario", "manual para [perfil]", "user manual sermas", "OC_MAN" |
| GEN  | "documento genérico", "doc técnico sermas", "JWT sermas", "KPIs sermas", "documento de guías", "OP_GEN" |

If ambiguous → AskQuestionTool with the 4 options.

### 1.2 Mode (create vs update)

- If the prompt contains a Google Doc URL or ID → **update mode** (read the doc, detect type by headings, reescribir secciones que el usuario pida). See `references/update-flow.md`.
- If not → **create mode** (duplicate canon template).

### 1.3 Content source

- Conversación directa con el usuario (por defecto).
- Documento previo en Drive/Notion/Markdown/fichero local (si el usuario pasa URL o ruta).

---

## Step 2: Gather Minimum Requirements

Por tipo, los campos no inferibles del prompt se piden con AskQuestionTool (preferentemente con opciones, no texto libre). Ver la sección correspondiente en el reference file de cada tipo.

**Comunes a todos los tipos**:

| Field | Required | Default |
|-------|----------|---------|
| Autor | Yes | cuenta autenticada o preguntar |
| Fecha | Yes | hoy (`DD/MM/AAAA`) |
| Carpeta destino | Yes | `SERMAS_FOLDER_ID` si el usuario no indica |
| Idioma | Yes | español |

Específicos: ver §7 de `PLAN.md` (replicado en cada reference). Resumen:

- **DPE**: código JIRA (para filename), subsistema, contenido de §1 Introducción / §2 Requisitos / §3 Descripción Funcional.
- **GEN**: título, tipo de documento (subtítulo portada), versión (default 1.0), lista de capítulos H1/H2/H3 + cuerpo.
- **ACR**: código proyecto, fecha reunión, asistentes, alcance, temas tratados, resoluciones, próximos pasos.
- **MAN**: nombre aplicación, identificador/portada, lista de perfiles, contenido común + contenido por perfil.

---

## Step 3: Copy Template (create mode only)

### 3.1 Filename (nomenclatura oficial)

| Type | Patrón |
|------|--------|
| DPE  | `OC_DPE_{CODIGO_JIRA}_ALCANCE_FUNCIONAL_{SUBSISTEMA}` |
| GEN  | `OP_GEN_{TITULO}_v{VERSION}` |
| ACR  | `OP_ACR_{YYYYMMDD}_{PROYECTO}` |
| MAN  | `OC_MAN_{APLICACION}_{PERFIL_SLUG}_v{VERSION}` (un doc por perfil) |

Espacios → `_`; remover acentos si el usuario no insiste en conservarlos.

### 3.2 Copy

```bash
CI=true gws drive files copy \
  --params '{"fileId": "TEMPLATE_ID"}' \
  --json '{"name": "NUEVO_NOMBRE", "parents": ["FOLDER_ID"]}'
```

- `TEMPLATE_ID` = constante según tipo (ver §Constants).
- `FOLDER_ID` = la que indique el usuario, o `SERMAS_FOLDER_ID` por defecto.
- Extraer el `id` de la respuesta → es el `DOC_ID` a editar.

Para **MAN multi-perfil**: ejecutar un `files.copy` por perfil, con el filename sufijado por perfil.

---

## Step 4: Read Document Structure

```bash
CI=true gws docs documents get --params '{"documentId": "DOC_ID"}'
```

Construir un mapa interno con:

- **Párrafos** del `body.content[]`: `startIndex`, `endIndex`, `paragraphStyle.namedStyleType`, texto concatenado.
- **Tablas** del body: cabecera (texto de la primera fila), `startIndex`/`endIndex`, y por cada `tableCell` los `startIndex`/`endIndex` del primer párrafo.
- **Headers (`doc.headers`) y Footers (`doc.footers`)** — ⚠️ **NO olvidarse**: las 4 plantillas Sermas tienen placeholders en encabezados y pies. Si solo escaneas `body`, se quedan sin sustituir y aparecen en el entregable. Recorrer cada `headers[id].content[]` y `footers[id].content[]` igual que el body.
- **Placeholders literales**: strings entre `<...>` **Y entre `[...]`** (ver §5.1). Ejemplos: `<DD/MM/AAAA>`, `<Nombre de la persona que creó el documento>`, `<Identificador/Aplicación>`, `<NOMBRE DE LA APLICACIÓN>`, `<01.00>`, `<CÓDIGO PROYECTO>`, `<CODIGO PROYECTO>` (sin acento, en header del ACR), `<Equipo que realiza el documento>` (footer), `<Departamento que realiza el documento >` (footer, con espacio final), `<unidad que genera el documento>` (footer GEN), `<Descripción del alcance de la reunión>` (header ACR), `[Nombre del Proyecto]`, `[Título del Documento]` (header ACR alternativo). Ver cada reference para la lista completa por tipo.

⚠️ **Gotcha de acentos**: `<CODIGO PROYECTO>` (sin acento) en el header del ACR vs `<CÓDIGO PROYECTO>` (con acento) en el body. Son dos strings distintos — un `replaceAllText` para uno no afecta al otro.

El comando `gws docs documents get` escribe `Using keyring backend: keyring` a **stderr**, no a stdout — con `>` redirect obtienes JSON limpio directamente.

---

## Step 5: Generate Content per Section

Ver el reference file del tipo correspondiente. El resultado es una lista de operaciones `batchUpdate`, mezclando:

- `replaceAllText` para placeholders globales literales (una pasada inicial, antes de tocar índices). **Actúa sobre body + headers + footers simultáneamente** — por eso es la forma más eficiente de limpiar placeholders repetidos.
- `deleteContentRange` + `insertText` para cuerpos de sección (entre heading X y heading X+1), **de índice más alto a más bajo**.
- `insertTableRow` + `insertText` celda a celda para tablas estructuradas (asistentes, riesgos, próximos pasos, documentos relacionados).

### 5.1 Dos sintaxis de placeholders en las plantillas

- `<...>` — la mayoría de placeholders Sermas.
- `[...]` — usado en el header alternativo del ACR (`[Nombre del Proyecto]`, `[Título del Documento]`). Si tu escaneo solo busca `<...>`, estos se quedan sin sustituir.

Al escanear los docs generados para QA final, usa regex `[<\[][^<>\[\]]{2,}[>\]]` para capturar ambas sintaxis.

### 5.2 Placeholders de header/footer por plantilla

| Plantilla | Segmento | Placeholder | Valor típico |
|-----------|----------|-------------|--------------|
| DPE | footer | `<Equipo que realiza el documento>` | `BINPAR` |
| GEN | footer | `<unidad que genera el documento>` | `BINPAR` |
| ACR | header | `<CODIGO PROYECTO>` (sin acento) | código JIRA / proyecto |
| ACR | header | `<Descripción del alcance de la reunión>` | descripción corta |
| ACR | header | `[Nombre del Proyecto]` | mismo que CÓDIGO PROYECTO |
| ACR | header | `[Título del Documento]` | `Acta de reunión` |
| ACR | footer | `<Equipo que realiza el documento>` | `BINPAR` |
| ACR | footer | `<Departamento que realiza el documento >` | `DGSD` (ojo: espacio final) |
| MAN | — | (sin placeholders de header/footer) | — |

### 5.x Patrones

**Rellenar celda de tabla vacía** (cabeceras ya existen, el primer párrafo de la celda suele tener solo `\n`):

```json
{"insertText": {"location": {"index": CELL_TEXT_START}, "text": "contenido"}}
```

Si la celda tiene texto previo, `deleteContentRange` el texto (sin incluir el `\n` final) y luego `insertText`.

**Añadir fila a una tabla**:

```json
{
  "insertTableRow": {
    "tableCellLocation": {
      "tableStartLocation": {"index": TABLE_START_INDEX},
      "rowIndex": LAST_ROW_INDEX,
      "columnIndex": 0
    },
    "insertBelow": true
  }
}
```

Tras `insertTableRow`, re-leer el doc para obtener los índices de las celdas nuevas antes de escribir en ellas.

**Aplicar heading a un párrafo insertado**:

```json
{"insertText": {"location": {"index": IDX}, "text": "Capítulo 1\n"}},
{"updateParagraphStyle": {
  "range": {"startIndex": IDX, "endIndex": IDX + LEN + 1},
  "paragraphStyle": {"namedStyleType": "HEADING_1"},
  "fields": "namedStyleType"
}}
```

---

## Step 6: Bump Hoja de Control

Ver `references/hoja-control.md` para el algoritmo completo. Resumen:

1. Localizar la tabla **"Control de cambios"** (cabecera: `Versión | Fecha versión | Motivo del cambio | Autor` — en el ACR es `Versión | Fecha cambio | Responsable | Motivo del cambio`).
2. Leer la última fila no vacía → versión actual (ej. `1.00`).
3. Calcular nueva versión:
   - **Create**: `1.00` (reemplaza el placeholder `<01.00>` o `<DD/MM/AAAA>` de la plantilla por valores reales).
   - **Update**: bump `+0.01` por defecto, o `+1.00` si el usuario lo pide explícitamente.
4. `insertTableRow` bajo la última fila → rellenar `{nueva_versión, hoy DD/MM/AAAA, motivo, autor}` (o el orden correspondiente al ACR).
5. En la portada, reemplazar el texto `Versión: <...>` o `Versión: 1.0` con la nueva versión.

**Nunca** se toca la tabla "Control de Aprobaciones".

---

## Step 7: Execute batchUpdate

```bash
CI=true gws docs documents batchUpdate \
  --params '{"documentId": "DOC_ID"}' \
  --json '{"requests": [...]}'
```

Reglas:

- Mantener cada batch bajo ~50 operaciones. Si hay más, partir.
- **Orden**: índices descendentes. Si se usa `insertTableRow` o cualquier op que cambie la longitud de una tabla, re-leer el doc después y reconstruir requests para las ops siguientes.
- Si el batch falla con error de índice → re-leer el doc (Step 4) y reconstruir.
- **⚠️ Nunca mezclar `deleteContentRange` sobre texto de celdas con `deleteTableRow` en el mismo batch**: la API colapsa filas no intencionadas. Secuencia segura: (a) `deleteTableRow` PRIMERO sobre filas vacías de la plantilla, (b) luego `insertText` en las filas que quedan, (c) `insertTableRow` y re-lectura para filas extras. Ver `references/gws-docs-commands.md` §4.1-4.2.
- **⚠️ Estilo residual tras `deleteContentRange` + `insertText`**: el texto insertado hereda `namedStyleType` del párrafo borrado. Si borras un `HEADING_1` y lo sustituyes por cuerpo, aplicar `updateParagraphStyle` a `NORMAL_TEXT` después.
- **⚠️ `replaceAllText` es global**: revisa que el string sea único o que te convenga sustituir todas las apariciones.

---

## Step 8: Return Result

### 8.1 Get Google Doc URL

```bash
CI=true gws drive files get --params '{"fileId": "DOC_ID", "fields": "id,name,webViewLink"}'
```

### 8.2 Present to user

Mostrar en el chat (texto plano, no solo en tool output):

- La(s) URL(s) del/los Google Doc(s) generado(s) o actualizado(s) — en MAN, una URL por perfil.
- Resumen: tipo, modo (create/update), qué secciones se escribieron, nueva versión en Hoja de Control, motivo del cambio registrado.
- Recordatorio: revisar manualmente (a) índice / TOC si aplica — `gws docs` no regenera el TOC, el usuario debe hacer click derecho → "Actualizar tabla de contenidos"; (b) tablas de aprobación (responsables humanos).

### 8.3 QA final — escaneo de placeholders residuales

Antes de entregar la URL, escanear body + headers + footers buscando `[<\[][^<>\[\]]{2,}[>\]]`. Si hay matches:

- Revisor/Aprobador (ACR) → intencional, se dejan para rellenar a mano.
- Cualquier otro (`<DD/MM/AAAA>`, `<Equipo...>`, `<Nombre...>`, `[Título...]`, etc.) → **no intencional**: volver a Step 5 y aplicar `replaceAllText` con el valor correcto.

**IMPORTANT:** siempre mostrar la URL como texto plano en el chat.

---

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| `gws` not found | CLI no instalado | "Pídeme 'Set up BinPar tools'" |
| 401 Unauthorized | Token expirado | `CI=true gws auth login`, mostrar URL en chat |
| Template inaccesible | Permisos | Verificar que los 4 Doc IDs canon están accesibles a la cuenta autenticada |
| `batchUpdate` falla por `startIndex` inválido | Una op previa invalidó posiciones | Re-leer el doc (Step 4) y reconstruir requests |
| TOC no se actualiza | `gws docs` no refresca TOC automático | Nota al usuario: abrir el doc y actualizar tabla de contenidos manualmente |
| >10 perfiles en MAN | Cada perfil = 1 copy + 1 batchUpdate | Procesar en serie; avisar al usuario si supera 10 |
| Doc existente con estructura no reconocida (update) | Alguien editó headings a mano | Abortar update y pedir al usuario que indique el rango manualmente |
| Placeholder `<...>` no encontrado | Plantilla ya editada | Saltarlo; no bloquea el resto |
| `insertText` en celda fusiona estilos raros | Runs previos con estilo residual | Tras `deleteContentRange`+`insertText`, opcional `updateTextStyle` con canonical (Calibri/Arial según plantilla) |

Si un `batchUpdate` falla, siempre re-leer la estructura antes de reintentar: los índices pueden haber cambiado.
