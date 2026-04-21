# `gws docs` / `gws drive` commands cheatsheet

Todos los comandos van prefijados con `CI=true` para desactivar la TUI y obtener JSON plano.

La salida de `gws` empieza con la línea `Using keyring backend: keyring` antes del JSON. Al parsear, saltarla (`tail -n +2`) o usar `jq` tolerando las 2 formas.

## 1. Drive

### 1.1 Copiar un Google Doc canon y ubicarlo en una carpeta

```bash
CI=true gws drive files copy \
  --params '{"fileId": "TEMPLATE_ID"}' \
  --json '{"name": "NUEVO_NOMBRE", "parents": ["FOLDER_ID"]}'
```

### 1.2 Convertir un `.docx` a Google Doc (primera subida de plantillas)

```bash
CI=true gws drive files copy \
  --params '{"fileId": "DOCX_FILE_ID"}' \
  --json '{"name": "NOMBRE Google Doc", "parents": ["FOLDER_ID"], "mimeType": "application/vnd.google-apps.document"}'
```

### 1.3 Buscar una carpeta por nombre

```bash
CI=true gws drive files list \
  --params '{"q": "name = '\''Sermas'\'' and mimeType = '\''application/vnd.google-apps.folder'\''", "pageSize": 5}'
```

### 1.4 Listar contenido de una carpeta

```bash
CI=true gws drive files list \
  --params '{"q": "'\''FOLDER_ID'\'' in parents", "pageSize": 50, "fields": "files(id,name,mimeType)"}'
```

### 1.5 Obtener info + URL de un archivo

```bash
CI=true gws drive files get \
  --params '{"fileId": "DOC_ID", "fields": "id,name,webViewLink,parents"}'
```

### 1.6 Auth

```bash
CI=true gws auth status
CI=true gws auth login   # imprime URL de OAuth — mostrarla al usuario en chat
```

## 2. Docs

### 2.1 Leer un documento

```bash
CI=true gws docs documents get --params '{"documentId": "DOC_ID"}' > /tmp/doc.json
```

El comando escribe `Using keyring backend: keyring` a stderr; con `>` redirect obtienes JSON limpio. Para documentos grandes (>30k líneas), siempre volcar a fichero y parsear con Python/`jq` desde ahí.

⚠️ **El JSON tiene `body`, `headers`, `footers` como claves top-level**. Cuando escaneas el documento (por ejemplo buscando placeholders, o construyendo el mapa de índices), recorre las tres. Si solo miras `body`, los placeholders de encabezado/pie aparecen en el entregable final.

```python
for segment in ('body',):
    walk(doc[segment]['content'])
for hid, hd in (doc.get('headers') or {}).items():
    walk(hd['content'])
for fid, fd in (doc.get('footers') or {}).items():
    walk(fd['content'])
```

### 2.2 batchUpdate — request principal

```bash
CI=true gws docs documents batchUpdate \
  --params '{"documentId": "DOC_ID"}' \
  --json '{"requests": [ ... ]}'
```

## 3. Requests de `batchUpdate` usadas

### 3.1 `replaceAllText`

Seguro para strings únicos (portada, placeholders `<...>`). Evita conflictos: si el string aparece en varias ubicaciones y quieres reemplazos distintos, usa índices.

```json
{"replaceAllText": {
  "containsText": {"text": "<DD/MM/AAAA>", "matchCase": true},
  "replaceText": "21/04/2026"
}}
```

### 3.2 `deleteContentRange` + `insertText`

Para reescribir cuerpos de sección. **No incluyas el `\n` final del párrafo en el rango**: ese newline transporta el `paragraphStyle`.

```json
{"deleteContentRange": {"range": {"startIndex": 3742, "endIndex": 3827}}},
{"insertText": {"location": {"index": 3742}, "text": "Nuevo contenido aquí."}}
```

### 3.3 `insertText` puro

Añade texto en un índice. Si se incluye `\n`, crea párrafo nuevo que hereda el estilo del párrafo donde se inserta.

```json
{"insertText": {"location": {"index": 3742}, "text": "Capítulo 1\nPárrafo del capítulo...\n"}}
```

### 3.4 `updateParagraphStyle`

Aplica heading u otro estilo a un rango de párrafo.

```json
{"updateParagraphStyle": {
  "range": {"startIndex": 3742, "endIndex": 3753},
  "paragraphStyle": {"namedStyleType": "HEADING_1"},
  "fields": "namedStyleType"
}}
```

Valores posibles: `TITLE`, `SUBTITLE`, `HEADING_1`, `HEADING_2`, `HEADING_3`, `HEADING_4`, `NORMAL_TEXT`.

### 3.5 `updateTextStyle`

Para negrita, cursiva, color. Útil tras `insertText` si el run arrastra estilo residual.

```json
{"updateTextStyle": {
  "range": {"startIndex": 3742, "endIndex": 3753},
  "textStyle": {"bold": true, "fontSize": {"magnitude": 11, "unit": "PT"}, "weightedFontFamily": {"fontFamily": "Calibri"}},
  "fields": "bold,fontSize,weightedFontFamily"
}}
```

### 3.6 `insertTableRow`

Añade fila encima/debajo de otra fila existente.

```json
{"insertTableRow": {
  "tableCellLocation": {
    "tableStartLocation": {"index": TABLE_START_INDEX},
    "rowIndex": REFERENCE_ROW,
    "columnIndex": 0
  },
  "insertBelow": true
}}
```

Después, re-leer el doc para obtener los startIndex de las celdas nuevas.

### 3.7 `deleteTableRow`

```json
{"deleteTableRow": {
  "tableCellLocation": {
    "tableStartLocation": {"index": TABLE_START_INDEX},
    "rowIndex": ROW_TO_DELETE,
    "columnIndex": 0
  }
}}
```

Borrar end-to-start (índices de fila altos primero).

### 3.8 `insertTable`

Crea una tabla nueva en un índice.

```json
{"insertTable": {
  "location": {"index": TARGET_INDEX},
  "rows": N,
  "columns": M
}}
```

## 4. Ordenación de requests

Regla de oro: **índices descendentes** para ops que cambien longitud (delete/insert). Para ops que no cambian longitud (`updateTextStyle`, `updateParagraphStyle` sobre rangos ya existentes), el orden no importa.

Si se mezclan `insertTableRow` con cualquier otra op sobre el mismo doc → hacer el batch de `insertTableRow` solo, re-leer el doc, y construir el siguiente batch con los índices actualizados.

### 4.1 ⚠️ NUNCA combinar `deleteContentRange` dentro de celdas + `deleteTableRow` en el mismo batch

Observación empírica en tests end-to-end: un `batchUpdate` que mezcla `deleteContentRange` sobre texto de celdas con `deleteTableRow` sobre la misma tabla falla con "row index N should be less than the total number of rows 1" y en algunos casos llega a colapsar la tabla, borrando filas que no tocabas.

Patrón correcto: **tres batches separados con re-lectura entre ellos**:

1. **Batch A**: `replaceAllText` + `deleteContentRange`/`insertText` dentro de celdas (end-to-start).
2. Re-leer el doc.
3. **Batch B**: `deleteTableRow` para filas vacías sobrantes, una por tabla como máximo por batch. Si hay múltiples → hacer un `batchUpdate` por borrado y re-leer entre medias.
4. Re-leer.
5. **Batch C**: cualquier ajuste final (`updateParagraphStyle`, bump de Hoja de Control).

### 4.2 ⚠️ `deleteTableRow` puede borrar filas adyacentes tras edición reciente

En tests: tras llenar r1 de una tabla con `insertText` y luego pedir `deleteTableRow rowIndex=4` en un batch posterior, la API eliminó también los datos de r1. Motivo no confirmado (parece una condición de carrera entre renders internos).

**Mitigación**: hacer las eliminaciones de filas vacías **ANTES** de poblar las filas de datos. Flujo revisado para tablas con plantilla pre-filled:

1. Re-leer el doc.
2. **Batch A**: `deleteTableRow` de todas las filas sobrantes (una por batch para mayor seguridad).
3. Re-leer.
4. **Batch B**: llenar celdas de las filas que quedan.

Si ocurre el bug y borras filas que tenían datos → re-leer el doc, usar `insertTableRow` para recuperar la estructura y rellenar las celdas nuevas.

### 4.3 Propagación de estilos en `deleteContentRange` + `insertText`

Al sustituir el cuerpo de una sección con un heading reemplazado (ej. el placeholder `TÍTULO 1` del OP_GEN), el texto insertado **hereda el `namedStyleType` del párrafo deletado**. Si el heading era `HEADING_1`, los párrafos nuevos salen como `HEADING_1` aunque sea prosa de cuerpo.

**Mitigación**: siempre que se sustituya un cuerpo que cruza un heading, seguir el `insertText` con `updateParagraphStyle` a `NORMAL_TEXT` sobre cada párrafo de cuerpo. Para headings (H1/H2/H3) intermedios en el contenido insertado, aplicar el estilo correspondiente.

Patrón práctico:

```
1. Re-leer el doc tras el insertText.
2. Identificar el rango de cada párrafo del cuerpo insertado.
3. batchUpdate con un updateParagraphStyle por párrafo con el namedStyleType correcto.
```

### 4.4 `replaceAllText` es greedy

`replaceAllText` reemplaza TODAS las ocurrencias. Si el string `"AUTOR"` aparece en portada Y en la Hoja de Control (`"AUTOR - COMPAÑIA"`), ambas se reemplazan.

- Cuando eso es lo deseado (mismo valor en varios sitios): perfecto.
- Cuando no: usar substrings más específicos, o ir por índice con `deleteContentRange` + `insertText`.

## 5. Tamaño de batch

- Mantener cada `batchUpdate` bajo ~50 operaciones.
- Si falla por tamaño o timeout: partir por secciones.
- Si falla por `startIndex` inválido: re-leer el doc y rebuild requests.

## 6. Diagnosticar errores comunes

| Error mensaje | Significado | Solución |
|---------------|-------------|----------|
| `Invalid requests[N].deleteContentRange: Invalid range` | El rango cruza un table/section break | Acortar el rango o partir en varias ops |
| `Invalid requests[N].insertText: The location doesn't accept insertions` | Intentando insertar en un índice protegido (fin del doc, dentro de un table boundary) | Ajustar el índice; si es final del doc, usar `endOfSegmentLocation` |
| `The document structure has changed` | Otro batch ya modificó el doc desde que se leyó | Re-leer y reintentar |
| `The text to be removed must be within the segment` | El `endIndex` está fuera del segmento (body/header/footer) | Verificar que el rango está dentro del mismo `segmentId` |

## 7. Parseo del JSON

**Observación empírica**: la línea `Using keyring backend: keyring` va a **stderr**, no a stdout. Si redirigiras con `> file.json` obtienes JSON limpio. Si redirigiras con `2>&1 > file.json` tienes que saltarte la primera línea.

Patrón robusto que tolera ambos casos:

```bash
CI=true gws docs documents get --params '{"documentId": "ID"}' > /tmp/doc.json 2>/dev/null
jq '.body.content | length' /tmp/doc.json
```

O en Python:

```python
raw = subprocess.run([...], env={**os.environ, "CI": "true"}, capture_output=True, text=True).stdout
# Tolera ambos: stdout limpio O con "Using keyring backend: keyring" de prefijo
doc = json.loads(raw if raw.lstrip().startswith('{') else raw.split('\n', 1)[1])
```
