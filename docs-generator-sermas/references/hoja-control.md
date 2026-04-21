# Hoja de Control — bump de versión y nueva fila en Control de cambios

Patrón común a las 4 plantillas Sermas. La Hoja de Control tiene **dos tablas**:

1. **Control de cambios** — SÍ se toca (añadir fila al bumpear).
2. **Control de Aprobaciones** — NO se toca (revisores/aprobadores humanos).

Además, la portada muestra "Versión: X.YZ" que debe reflejar la nueva versión.

## 1. Cabeceras por tipo de documento

| Tipo | Cabeceras "Control de cambios" | Orden de columnas |
|------|--------------------------------|-------------------|
| DPE  | `Versión | Fecha versión | Motivo del cambio | Autor` | 4 columnas |
| GEN  | `Versión | Fecha versión | Motivo del cambio | Autor` | 4 columnas |
| MAN  | `Versión | Fecha versión | Motivo del cambio | Autor` | 4 columnas |
| ACR  | `Versión | Fecha cambio | Responsable | Motivo del cambio` | 4 columnas, orden distinto |

Detección: localizar la tabla del doc leído cuyo primer row contiene las palabras "Versión" + "cambio" en la cabecera. Usar el texto de cada cabecera para saber el orden real (no asumir).

## 2. Localizar la tabla

Al leer el doc (`documents.get`), recorrer `body.content[]` buscando `table` cuyas cabeceras coincidan. Capturar:

- `TABLE_START` = `startIndex` del elemento `table`.
- `N_ROWS` = `len(table.tableRows)`.
- Para cada fila, los `startIndex` de la primera celda (para escribir sin ambigüedad).

Si hay varias tablas "Control de cambios" en el doc (no debería) → usar la primera en orden de `startIndex`.

## 3. Leer la versión actual

La última fila no vacía tiene la versión activa. Ejemplos de versiones que se encuentran en las plantillas canon:

- `1.00` (texto literal)
- `<01.00>` (placeholder, plantilla MAN/DPE sin inicializar)
- `1` (ACR — la plantilla trae "1" en la fila inicial)

Normalizar:

```python
def parse_version(s: str) -> tuple[int, int]:
    s = s.strip().strip("<>").lstrip("0") or "0"
    if "." in s:
        major, minor = s.split(".", 1)
        return (int(major or "0"), int(minor or "0"))
    return (int(s), 0)
```

Para ACR, donde la fila inicial es "1", tratar como `(1, 0)`.

## 4. Calcular nueva versión

| Modo | Input | Nueva versión |
|------|-------|---------------|
| Create (inicial) | versión actual = placeholder o vacía | `1.00` (o `1` para ACR) |
| Update (bump menor) | versión actual `(M, m)` | `(M, m+1)` → ej. `1.00` → `1.01` |
| Update (bump mayor, a petición) | versión actual `(M, m)` | `(M+1, 0)` → ej. `1.03` → `2.00` |

Formato de salida: siempre 2 decimales en DPE/GEN/MAN (`1.00`, `1.01`, `2.00`). En ACR usar entero si el usuario no pide decimales (`1`, `2`) — el template usa "1" en la fila inicial.

## 5. Operación: rellenar fila inicial (create)

Si la plantilla canon trae una fila inicial con placeholders (caso DPE/MAN):

```
1.00 | <DD/MM/AAAA> | <Describir detalladamente…> | <Nombre de la persona que creó el documento>
```

→ Usar `replaceAllText` para los 3 placeholders (`<DD/MM/AAAA>`, `<Describir…>`, `<Nombre…>`). La versión `1.00` ya es correcta.

En ACR, la fila inicial es:

```
1 | <DD/MM/AAAA> | <Nombre de la persona que creó el documento> | <Describir detalladamente…>
```

→ Mismo patrón, ajustando orden (ver cabeceras §1).

En GEN, la fila inicial es:

```
1.00 | DD/MM/AAAA | Versión Inicial | AUTOR - COMPAÑIA
```

→ NO son placeholders `<...>`, son texto literal. Localizar cada celda por índice y hacer `deleteContentRange` + `insertText`:

- `DD/MM/AAAA` → fecha real.
- `Versión Inicial` → dejar tal cual (ya dice "Versión Inicial") o reemplazar por motivo específico.
- `AUTOR - COMPAÑIA` → `"{Nombre} - BINPAR"` (o compañía del usuario).

## 6. Operación: añadir fila (update)

```json
{
  "insertTableRow": {
    "tableCellLocation": {
      "tableStartLocation": {"index": TABLE_START},
      "rowIndex": LAST_ROW_INDEX,
      "columnIndex": 0
    },
    "insertBelow": true
  }
}
```

Después:

1. Re-leer el doc para obtener los startIndex de las celdas nuevas (la fila insertada viene sin texto, solo con `\n` en cada celda).
2. Segundo `batchUpdate` con 4 `insertText`, uno por celda:

```json
{"insertText": {"location": {"index": CELL_0_START}, "text": "1.01"}},
{"insertText": {"location": {"index": CELL_1_START}, "text": "21/04/2026"}},
{"insertText": {"location": {"index": CELL_2_START}, "text": "Actualización sección 3.1"}},
{"insertText": {"location": {"index": CELL_3_START}, "text": "Alberto Blanco"}}
```

(Orden de celdas según cabeceras del tipo — atento al orden distinto del ACR.)

**Importante**: al añadir texto en la celda, el `\n` ya existente en ella queda DESPUÉS del texto nuevo. No incluir `\n` en el `insertText`.

## 7. Actualizar la versión en portada

Localizar el párrafo de portada que contiene "Versión: X" y reescribirlo:

- Si la plantilla trae `Versión: <01.00>` (MAN/DPE) → `replaceAllText "<01.00>" → "1.00"` funciona.
- Si la plantilla trae `Versión: 1.0` (GEN) → es texto literal. Buscar por índice y `deleteContentRange` + `insertText` solo sobre la parte numérica (no reemplazar "Versión: " para no duplicarlo).

**Estrategia más robusta**: al leer el doc, buscar un párrafo cuyo texto empiece con "Versión: " — capturar el startIndex del número, calcular endIndex = start + len(versión_actual), y hacer delete+insert sobre ese rango.

## 8. Motivo del cambio — heurísticas

Si el usuario no especifica un motivo, inferir según lo que se escribió:

- "Actualización sección X" si se tocó una sola sección.
- "Revisión de contenido" si se tocaron varias secciones.
- "Versión inicial" en create mode.
- "Incorporación de asistentes y próximos pasos" (para ACR) si se añadieron filas a las tablas.

Es preferible preguntar al usuario por el motivo con AskQuestionTool antes de rellenar automáticamente.

## 9. Resumen de secuencia

```
1. Leer el doc → encontrar TABLE_START, N_ROWS, cabeceras, versión actual.
2. Calcular nueva versión.
3. [Create] replaceAllText para placeholders de la fila inicial + portada.
   [Update] insertTableRow abajo + batchUpdate para llenar celdas + actualizar portada.
4. (Opcional) insertTableRow extras si el usuario pide histórico multi-entrada.
```
